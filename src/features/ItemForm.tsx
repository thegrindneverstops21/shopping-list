import { useState, type ChangeEvent, type FormEvent } from "react";
import categories from "../utils/categories";
import FormField from "../components/FormField";
import { ImagePlus } from "lucide-react";
import Button from "../components/Button";
import { useLazySearchPhotosQuery, UNSPLASH_ACCESS_KEY } from "../api/unsplashApi";

interface ItemFormValues {
  name: string;
  quantity: number;
  notes: string;
  category: string;
  imageUrl: string;
}

interface ItemFormProps {
  initial?: Partial<ItemFormValues>;
  onSubmit: (data: ItemFormValues) => void;
  loading?: boolean;
  submitLabel?: string;
}

const defaultValues: ItemFormValues = {
  name: "",
  quantity: 1,
  notes: "",
  category: categories()[0],
  imageUrl: "",
};

export default function ItemForm({
  initial,
  onSubmit,
  loading,
  submitLabel = "Add item",
}: ItemFormProps) {
  const [values, setValues] = useState<ItemFormValues>({
    ...defaultValues,
    ...initial,
  });
  const [nameError, setNameError] = useState("");

  // Hook into Unsplash API
  const [triggerSearch, { isFetching: isSearchingImage }] = useLazySearchPhotosQuery();
  
  // Disable the button if parent is loading OR if we are fetching the image
  const isSubmitting = loading || isSearchingImage;

  function onChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  }

  function onImageFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setValues((prev) => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    const trimmedName = values.name.trim();
    if (!trimmedName) {
      setNameError("Item name is required");
      return;
    }
    setNameError("");

    let finalImageUrl = values.imageUrl;

    // Only search Unsplash if the user hasn't manually provided an image
    if (!finalImageUrl) {
      try {
        const { data: photos } = await triggerSearch(trimmedName);
        
        if (photos && photos.length > 0) {
          const firstPhoto = photos[0];
          finalImageUrl = firstPhoto.urls.small;
          
          // Silently trigger the Unsplash download endpoint
          fetch(`${firstPhoto.links.download_location}&client_id=${UNSPLASH_ACCESS_KEY}`).catch(() => {});
        }
      } catch (error) {
        console.error("Failed to fetch image from Unsplash:", error);
      }
    }

    // Pass the final values (including the automatically fetched image) to the parent
    onSubmit({ ...values, imageUrl: finalImageUrl });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label="Item name"
        name="name"
        value={values.name}
        onChange={onChange}
        error={nameError}
        required
        placeholder='e.g "Milk"'
      />
      <div className="form-field">
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          value={values.quantity}
          onChange={onChange}
        />
      </div>
      <div className="form-field">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={values.category}
          onChange={onChange}
        >
          {categories().map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={onChange}
          rows={2}
          placeholder="e.g full cream, 2L"
        />
      </div>
      <div className="form-field">
        <label htmlFor="imageUrl">Image URL (optional)</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="text"
          value={values.imageUrl.startsWith("data:") ? "" : values.imageUrl}
          onChange={onChange}
          placeholder="https://..."
        />
        <label className="item-form-upload">
          <ImagePlus size={16} /> Or upload an image
          <input
            type="file"
            accept="image/*"
            onChange={onImageFile}
            hidden
          />
        </label>
        {values.imageUrl && (
          <img
            src={values.imageUrl}
            alt="Preview"
            className="item-form-preview"
          />
        )}
      </div>
      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}