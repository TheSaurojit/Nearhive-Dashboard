// components/CKEditorComponent.tsx
import dynamic from "next/dynamic";
import { FC } from "react";

interface CKEditorProps {
  value: string;
  onChange: (data: string) => void;
}

const CKEditorComponent = dynamic<CKEditorProps>(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = (await import("@ckeditor/ckeditor5-build-classic")).default;

    const EditorComponent: FC<CKEditorProps> = ({ value, onChange }) => (
      <CKEditor
        editor={ClassicEditor as any}
        data={value}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    );

    return EditorComponent;
  },
  { ssr: false } // Disable SSR for CKEditor
);

export default CKEditorComponent;
