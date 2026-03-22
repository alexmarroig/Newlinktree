"use client";

import { Copy, FileText, Image, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatDate } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/client";
import type { Asset } from "@/types";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  STORAGE_BUCKET_IMAGES,
  STORAGE_BUCKET_PDFS,
} from "@/lib/constants";

interface AssetsManagerProps {
  profileId: string;
  assets: Asset[];
}

export function AssetsManager({
  profileId,
  assets: initialAssets,
}: AssetsManagerProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isPdf = ALLOWED_PDF_TYPES.includes(file.type);

    if (!isImage && !isPdf) {
      toast.error("Tipo de arquivo não suportado. Use imagens ou PDF.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      toast.error("Arquivo muito grande (máx 50MB).");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const bucket = isPdf ? STORAGE_BUCKET_PDFS : STORAGE_BUCKET_IMAGES;
      const ext = file.name.split(".").pop();
      const path = `${profileId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      // Salva no banco
      const { data: asset, error: dbError } = await supabase
        .from("assets")
        .insert({
          profile_id: profileId,
          name: file.name,
          file_path: path,
          public_url: publicUrl,
          file_type: isPdf ? "pdf" : "image",
          mime_type: file.type,
          size_bytes: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setAssets((prev) => [asset, ...prev]);
      toast.success("Arquivo enviado com sucesso!");
    } catch (err) {
      toast.error("Erro ao fazer upload. Tente novamente.");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(asset: Asset) {
    if (!confirm(`Deletar "${asset.name}"?`)) return;

    const supabase = createClient();

    // Remove do Storage
    const bucket =
      asset.file_type === "pdf" ? STORAGE_BUCKET_PDFS : STORAGE_BUCKET_IMAGES;
    await supabase.storage.from(bucket).remove([asset.file_path]);

    // Remove do banco
    await supabase.from("assets").delete().eq("id", asset.id);

    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    toast.success("Arquivo deletado");
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Arquivos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Imagens e PDFs do seu hub
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES].join(",")}
            onChange={handleUpload}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            <Upload className="h-4 w-4" />
            Enviar arquivo
          </Button>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base">
            {assets.length} arquivo{assets.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent padding="none">
          {assets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Upload className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nenhum arquivo enviado
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Enviar primeiro arquivo
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {assets.map((asset) => {
                const isImage = asset.file_type === "image";
                const Icon = isImage ? Image : FileText;

                return (
                  <li
                    key={asset.id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    {/* Preview / Ícone */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.public_url}
                          alt={asset.alt_text ?? asset.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {asset.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground capitalize">
                          {asset.file_type}
                        </span>
                        {asset.size_bytes && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-xs text-muted-foreground">
                              {formatBytes(asset.size_bytes)}
                            </span>
                          </>
                        )}
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(asset.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => copyUrl(asset.public_url)}
                        aria-label="Copiar URL"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(asset)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Deletar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
