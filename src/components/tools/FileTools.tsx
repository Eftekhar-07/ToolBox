import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { soundEffects } from '../../utils/audio';
import { Upload, Download, FileText, Image as ImageIcon, Trash2, Sliders } from 'lucide-react';

interface FileToolsProps {
  toolId: string;
  soundEnabled?: boolean;
}

export const FileTools: React.FC<FileToolsProps> = ({ toolId, soundEnabled = true }) => {
  // --- IMAGE TO PDF STATE ---
  const [imgFiles, setImgFiles] = useState<{ id: string; name: string; url: string }[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImgFiles((prev) => [
            ...prev,
            { id: Math.random().toString(), name: file.name, url: evt.target!.result as string },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const generateImgPdf = async () => {
    if (imgFiles.length === 0) return;
    setIsGeneratingPdf(true);
    soundEffects.playTap(soundEnabled);

    try {
      const doc = new jsPDF();
      for (let i = 0; i < imgFiles.length; i++) {
        if (i > 0) doc.addPage();
        const img = imgFiles[i];
        doc.addImage(img.url, 'JPEG', 10, 10, 190, 0);
      }
      doc.save('converted-images.pdf');
    } catch (err) {
      console.error('PDF generation error', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --- PDF MERGER STATE ---
  const [pdfFiles, setPdfFiles] = useState<{ id: string; file: File }[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.type === 'application/pdf') {
        setPdfFiles((prev) => [...prev, { id: Math.random().toString(), file }]);
      }
    });
  };

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) return;
    setIsMerging(true);
    soundEffects.playTap(soundEnabled);

    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of pdfFiles) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      link.click();
    } catch (err) {
      console.error('PDF merge error', err);
    } finally {
      setIsMerging(false);
    }
  };

  // --- PDF SPLITTER STATE ---
  const [splitPdfFile, setSplitPdfFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('1');
  const [isSplitting, setIsSplitting] = useState(false);

  const splitPdf = async () => {
    if (!splitPdfFile) return;
    setIsSplitting(true);
    soundEffects.playTap(soundEnabled);

    try {
      const arrayBuffer = await splitPdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const pageNum = parseInt(pageRange) || 1;
      const index = Math.max(0, Math.min(pageNum - 1, pdf.getPageCount() - 1));

      const [copiedPage] = await newPdf.copyPages(pdf, [index]);
      newPdf.addPage(copiedPage);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extracted-page-${pageNum}.pdf`;
      link.click();
    } catch (err) {
      console.error('PDF split error', err);
    } finally {
      setIsSplitting(false);
    }
  };

  // --- IMAGE COMPRESSOR STATE ---
  const [compressImg, setCompressImg] = useState<{
    file: File;
    url: string;
    origSizeKb: number;
    compUrl?: string;
    compSizeKb?: number;
  } | null>(null);

  const [quality, setQuality] = useState(70);

  const handleCompressFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setCompressImg({
      file,
      url,
      origSizeKb: Math.round(file.size / 1024),
    });
  };

  const processCompress = () => {
    if (!compressImg) return;
    soundEffects.playTap(soundEnabled);

    const img = new Image();
    img.src = compressImg.url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const compDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      const head = 'data:image/jpeg;base64,';
      const sizeInBytes = Math.round((compDataUrl.length - head.length) * 0.75);

      setCompressImg((prev) =>
        prev
          ? {
              ...prev,
              compUrl: compDataUrl,
              compSizeKb: Math.round(sizeInBytes / 1024),
            }
          : null
      );
    };
  };

  // RENDER BASED ON TOOL ID
  if (toolId === 'image_to_pdf') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon size={18} /> Image to PDF Converter
        </h3>

        <label className="block w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
          <Upload size={28} className="mx-auto text-indigo-600 mb-2" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Upload Images (JPG, PNG)
          </span>
          <span className="text-[11px] text-slate-400">Select photos from your device</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {imgFiles.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected Images ({imgFiles.length})
            </div>
            <div className="grid grid-cols-3 gap-2">
              {imgFiles.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-24"
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImgFiles((prev) => prev.filter((i) => i.id !== img.id))}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={generateImgPdf}
              disabled={isGeneratingPdf}
              className="w-full mt-3 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Download size={16} /> {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Document'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'pdf_merger') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText size={18} /> PDF Merger
        </h3>

        <label className="block w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
          <Upload size={28} className="mx-auto text-indigo-600 mb-2" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Upload PDF Files
          </span>
          <span className="text-[11px] text-slate-400">Select 2 or more PDFs to combine</span>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handlePdfUpload}
            className="hidden"
          />
        </label>

        {pdfFiles.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-400">PDF Files ({pdfFiles.length})</div>
            <div className="space-y-1.5">
              {pdfFiles.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {idx + 1}. {p.file.name}
                  </span>
                  <button
                    onClick={() => setPdfFiles((prev) => prev.filter((i) => i.id !== p.id))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={mergePdfs}
              disabled={pdfFiles.length < 2 || isMerging}
              className="w-full mt-3 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Download size={16} /> {isMerging ? 'Merging PDFs...' : 'Merge & Download Single PDF'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'pdf_splitter') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText size={18} /> PDF Splitter
        </h3>

        <label className="block w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
          <Upload size={28} className="mx-auto text-indigo-600 mb-2" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {splitPdfFile ? splitPdfFile.name : 'Upload PDF to Extract Page'}
          </span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files && setSplitPdfFile(e.target.files[0])}
            className="hidden"
          />
        </label>

        {splitPdfFile && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 font-medium">Page Number to Extract</label>
              <input
                type="number"
                min="1"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
              />
            </div>

            <button
              onClick={splitPdf}
              disabled={isSplitting}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Download size={16} /> {isSplitting ? 'Splitting...' : 'Extract & Download Page'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'image_compressor') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders size={18} /> Image Compressor
        </h3>

        <label className="block w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
          <Upload size={28} className="mx-auto text-indigo-600 mb-2" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {compressImg ? compressImg.file.name : 'Upload Image'}
          </span>
          <input type="file" accept="image/*" onChange={handleCompressFile} className="hidden" />
        </label>

        {compressImg && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>Compression Quality</span>
                <span>{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <button
              onClick={processCompress}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Compress Image
            </button>

            {compressImg.compUrl && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900 text-center space-y-2">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Original: <strong>{compressImg.origSizeKb} KB</strong> → Compressed:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {compressImg.compSizeKb} KB
                  </strong>
                </div>
                <a
                  href={compressImg.compUrl}
                  download={`compressed-${compressImg.file.name}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  <Download size={14} /> Download Compressed Photo
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};
