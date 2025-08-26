"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import clsx from "clsx";

type Props = {
  label: string;
  id: string;
  previewClassName?: string;
  onFileChange: (file: File | null) => void;
  previewImage?: string | null ;
};

const ImageUploadWithPreview: React.FC<Props> = ({
  label,
  id,
  previewClassName,
  onFileChange,
  previewImage = null,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(previewImage);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    } else {
      setPreviewUrl(null);
    }

    onFileChange?.(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input id={id} type="file" accept="image/*" onChange={handleChange} />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className={clsx(
            "mt-2 rounded border object-cover",
            previewClassName ?? "w-32 h-32"
          )}
        />
      )}
    </div>
  );
};

export default ImageUploadWithPreview;
