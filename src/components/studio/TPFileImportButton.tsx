import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useStudioStore } from "@/stores/studioStore";
import { parseTP } from "@/lib/tp-parser";

export function TPFileImportButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { setTPCode, setParseResult, setActiveTab } = useStudioStore();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const contents = await Promise.all(
        Array.from(files).map(async (f) => {
          const text = await f.text();
          return { name: f.name, text };
        })
      );

      const merged = contents
        .map(({ name, text }) => `// ===== Imported: ${name} =====\n${text.trim()}\n`)
        .join("\n");

      setTPCode(merged);
      setActiveTab("code");

      const result = parseTP(merged);
      setParseResult(result);

      if (result.errors.length > 0) {
        toast.error("Import terminé avec erreurs", {
          description: `${result.errors.length} erreur(s) détectée(s) par le parseur.`,
        });
      } else {
        toast.success("Import réussi", {
          description: `${files.length} fichier(s) .tp importé(s) et parsé(s).`,
        });
      }
    } catch (e: any) {
      setParseResult(null);
      toast.error("Import impossible", {
        description: e?.message ?? "Erreur inconnue lors de la lecture du fichier.",
      });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".tp,text/plain"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload className="w-4 h-4 mr-1.5" />
        Importer
      </Button>
    </>
  );
}
