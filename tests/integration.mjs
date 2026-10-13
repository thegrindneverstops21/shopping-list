import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "vite";

const require = createRequire(import.meta.url);
const jsonServer = require("json-server");
const api = jsonServer.create();
const router = jsonServer.router({ users: [], shoppingLists: [], items: [] });
let failItemDeletes = false;
let delayRegistrationResponse = false;
let delayedResponse;
const renderResponse = router.render;
router.render = (request, response) => {
    // Simulate an account being saved while its HTTP response never reaches the client.
    if (delayRegistrationResponse && request.method === "POST" && request.path === "/users") {
        delayedResponse = response;
        return;
    }
    renderResponse(request, response);
};
api.use(jsonServer.bodyParser);
api.use((request, response, next) => {
    if (failItemDeletes && request.method === "DELETE" && request.path.startsWith("/items/")) {
        return response.status(503).json({ message: "Temporary test failure" });
    }
    next();
});
api.use(router);
const listener = api.listen(0, "127.0.0.1");
await new Promise((resolve) => listener.once("listening", resolve));
process.env.VITE_API_BASE_URL = `http://127.0.0.1:${listener.address().port}`;
process.env.VITE_AES_SECRET = "";

// Deliberately broken saved data must not prevent the application from starting.
const storage = new Map([["currentUser", "{invalid-json"]]);
globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
};
const createTestVite = () => createServer({
    configFile: false,
    // Node should load CommonJS dependencies itself while Vite transforms our TypeScript.
    ssr: { external: ["crypto-js", "@reduxjs/toolkit", "react", "react-redux"] },
    server: { middlewareMode: true }, appType: "custom",
});
const setupVite = await createTestVite();
try {
    const { encryptPassword } = await setupVite.ssrLoadModule("/src/utils/encryption.ts");
    assert.throws(() => encryptPassword("example-password"), /VITE_AES_SECRET/);
    console.log("PASS: missing AES key produces a useful setup error");
} finally {
    await setupVite.close();
}
process.env.VITE_AES_SECRET = "integration-test-key";
const vite = await createTestVite();
let store;
try {
    const { authApi } = await vite.ssrLoadModule("/src/api/authApi.ts");
    const { listsApi } = await vite.ssrLoadModule("/src/api/listsApi.ts");
    const { itemsApi } = await vite.ssrLoadModule("/src/api/itemsApi.ts");
    const { decryptPassword } = await vite.ssrLoadModule("/src/utils/encryption.ts");
    const { toSafeUser } = await vite.ssrLoadModule("/src/utils/users.ts");
    const { setSession } = await vite.ssrLoadModule("/src/auth/authSlice.ts");
    const { getApiErrorMessage } = await vite.ssrLoadModule("/src/utils/apiErrors.ts");
    ({ store } = await vite.ssrLoadModule("/src/app/store.ts"));
    assert.equal(store.getState().auth.isAuthenticated, false);

    const run = async (endpoint, argument) => {
        const request = store.dispatch(endpoint.initiate(argument, { subscribe: false, forceRefetch: true }));
        return request.unwrap();
    };
    const user = await run(authApi.endpoints.registerUser, {
        name: "Test", surname: "Learner", email: " Person@Example.com ",
        phoneNumber: "0712345678", password: "example-password",
    });
    assert.equal(user.email, "person@example.com");
    assert.notEqual(user.password, "example-password");
    assert.equal(decryptPassword(user.password), "example-password");
    const matches = await run(authApi.endpoints.findUserByEmail, " PERSON@EXAMPLE.COM ");
    assert.equal(matches.length, 1);
    assert.equal(String(matches[0].id), String(user.id));
    assert.equal((await run(authApi.endpoints.findUserByEmail, "other@example.com")).length, 0);
    store.dispatch(setSession(toSafeUser(user)));
    assert.equal("password" in JSON.parse(storage.get("currentUser")), false);
    const updated = await run(authApi.endpoints.updateUser, { id: user.id, changes: { name: "Updated" } });
    assert.equal(updated.name, "Updated");
    console.log("PASS: registration, encrypted password/login lookup, profile update, safe session, corrupt storage");

    const list = await run(listsApi.endpoints.addList, { name: "Groceries", category: "General", userId: user.id });
    await run(listsApi.endpoints.shareList, { id: list.id, sharedWith: ["friend@example.com"] });
    assert.equal((await run(listsApi.endpoints.getList, { userId: "friend", email: "FRIEND@example.com" })).length, 1);
    assert.equal((await run(listsApi.endpoints.getList, { userId: "stranger", email: "stranger@example.com" })).length, 0);
    const item = await run(itemsApi.endpoints.addItem, { listId: list.id, name: "Milk (2L)", quantity: 1, category: "Groceries" });
    assert.equal((await run(itemsApi.endpoints.getItems, { listId: String(list.id), q: "(" })).length, 1);
    await run(itemsApi.endpoints.updateItem, { id: item.id, changes: { checked: true } });
    assert.equal((await run(itemsApi.endpoints.getItems, { listId: String(list.id) }))[0].checked, true);
    failItemDeletes = true;
    await assert.rejects(run(listsApi.endpoints.deleteList, list.id), (error) => error.status === 503);
    await assert.rejects(run(authApi.endpoints.deleteAccount, { userId: user.id }), (error) => error.status === 503);
    assert.equal(router.db.get("users").value().length, 1);
    assert.equal(router.db.get("shoppingLists").value().length, 1);
    failItemDeletes = false;
    await run(listsApi.endpoints.deleteList, list.id);
    assert.equal(router.db.get("items").value().length, 0);
    assert.equal(router.db.get("shoppingLists").value().length, 0);
    const nextList = await run(listsApi.endpoints.addList, { name: "Cleanup", category: "General", userId: user.id });
    await run(itemsApi.endpoints.addItem, { listId: nextList.id, name: "Bread", quantity: 1, category: "Groceries" });
    await run(authApi.endpoints.deleteAccount, { userId: user.id });
    assert.equal(router.db.get("users").value().length, 0);
    assert.equal(router.db.get("shoppingLists").value().length, 0);
    assert.equal(router.db.get("items").value().length, 0);
    console.log("PASS: shared-list visibility, literal search, item updates, failed deletes, cascading cleanup");

    delayRegistrationResponse = true;
    await assert.rejects(run(authApi.endpoints.registerUser, {
        name: "Timeout", surname: "Test", email: "timeout@example.com",
        phoneNumber: "0712345678", password: "example-password",
    }), (error) => {
        assert.equal(error.status, "TIMEOUT_ERROR");
        assert.match(getApiErrorMessage(error, "Registration failed"), /too long/);
        return true;
    });
    assert.equal(router.db.get("users").value().length, 1);
    delayedResponse?.destroy();
    delayRegistrationResponse = false;
    assert.equal((await run(authApi.endpoints.findUserByEmail, "timeout@example.com")).length, 1);
    console.log("PASS: saved account with a stalled response times out instead of loading forever");
} finally {
    delayedResponse?.destroy();
    store?.dispatch((await vite.ssrLoadModule("/src/api/baseApi.ts")).baseApi.util.resetApiState());
    await vite.close();
    await new Promise((resolve) => listener.close(resolve));
    delete globalThis.localStorage;
}
