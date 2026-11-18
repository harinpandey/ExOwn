"use client";

import { useState } from "react";
import {
  CalendarDays,
  Eye,
  ImagePlus,
  Megaphone,
  Monitor,
  PauseCircle,
  PlayCircle,
  Plus,
  Smartphone,
  X,
} from "lucide-react";
import { createAdminAd, toggleAdminAd, type AdminAdInput } from "@/actions/ads";

type AdminAd = {
  id: string;
  title: string;
  sponsorName: string;
  imageUrl: string;
  linkUrl: string;
  placement: "HOMEPAGE" | "CATEGORY" | "SEARCH";
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
};

function dateInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

const defaultImage = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85";

export default function AdsManager({ initialAds }: { initialAds: AdminAd[] }) {
  const [ads, setAds] = useState(initialAds);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAd, setPreviewAd] = useState<AdminAd | null>(null);
  const [form, setForm] = useState<AdminAdInput>(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    return {
      title: "Student tech, smarter prices.",
      sponsorName: "ExOwn Campus Deals",
      imageUrl: defaultImage,
      linkUrl: "/search?category=computers-laptops",
      placement: "HOMEPAGE",
      startDate: dateInputValue(today),
      endDate: dateInputValue(end),
    };
  });

  const updateForm = (key: keyof AdminAdInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value } as AdminAdInput));
    setPreviewAd(null);
    setNotice("");
    setError("");
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice("");
    setError("");

    try {
      const result = await createAdminAd(form);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setAds((current) => [result.ad as AdminAd, ...current]);
      setNotice("Banner saved as inactive. Review it below, then activate it when ready.");
    } catch {
      setError("Unable to save the banner. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (ad: AdminAd) => {
    setError("");
    setNotice("");
    const result = await toggleAdminAd(ad.id, !ad.isActive);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setAds((current) => current.map((item) => item.id === ad.id ? { ...item, isActive: !ad.isActive } : item));
    setNotice(ad.isActive ? "Banner paused." : "Banner activated.");
  };

  const image = form.imageUrl.trim() || defaultImage;
  const preview = previewAd ?? form;
  const previewImage = preview.imageUrl.trim() || defaultImage;

  return (
    <div className="space-y-7">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <form onSubmit={handleCreate} className="rounded-2xl border border-[#E2E8E5] bg-white p-5 shadow-[0_2px_8px_rgba(19,34,29,0.04)] sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-[#13221D]">Create a banner</h2>
              <p className="mt-1 text-sm text-[#4A5D56]">Add the image, copy and destination for a sponsored placement.</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646]">
              <ImagePlus size={20} />
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-bold text-[#13221D]">Banner headline</span>
              <input value={form.title} onChange={(e) => updateForm("title", e.target.value)} maxLength={90} required className="w-full rounded-xl border border-[#E2E8E5] bg-white px-3.5 py-3 text-sm text-[#13221D] outline-none focus:border-[#1E5646] focus:ring-2 focus:ring-[#1E5646]/10" placeholder="Student tech, smarter prices." />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[#13221D]">Sponsor / brand</span>
              <input value={form.sponsorName} onChange={(e) => updateForm("sponsorName", e.target.value)} maxLength={60} required className="w-full rounded-xl border border-[#E2E8E5] bg-white px-3.5 py-3 text-sm text-[#13221D] outline-none focus:border-[#1E5646]" placeholder="ExOwn Campus Deals" />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[#13221D]">Placement</span>
              <div className="w-full rounded-xl border border-[#E2E8E5] bg-[#F7F9F8] px-3.5 py-3 text-sm font-semibold text-[#1E5646]">Homepage banner strip</div>
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-bold text-[#13221D]">Banner image URL</span>
              <input type="url" value={form.imageUrl} onChange={(e) => updateForm("imageUrl", e.target.value)} required className="w-full rounded-xl border border-[#E2E8E5] bg-white px-3.5 py-3 text-sm text-[#13221D] outline-none focus:border-[#1E5646]" placeholder="https://..." />
              <span className="block text-[11px] leading-5 text-[#4A5D56]">Use a public HTTPS image URL, such as a Cloudinary banner image. Recommended ratio: 2:1.</span>
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-bold text-[#13221D]">Destination link</span>
              <input value={form.linkUrl} onChange={(e) => updateForm("linkUrl", e.target.value)} required className="w-full rounded-xl border border-[#E2E8E5] bg-white px-3.5 py-3 text-sm text-[#13221D] outline-none focus:border-[#1E5646]" placeholder="/search or https://partner.example" />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[#13221D]">Start date</span>
              <input type="date" value={form.startDate} onChange={(e) => updateForm("startDate", e.target.value)} required className="w-full rounded-xl border border-[#E2E8E5] bg-white px-3.5 py-3 text-sm text-[#13221D] outline-none focus:border-[#1E5646]" />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[#13221D]">End date</span>
              <input type="date" value={form.endDate} onChange={(e) => updateForm("endDate", e.target.value)} required className="w-full rounded-xl border border-[#E2E8E5] bg-white px-3.5 py-3 text-sm text-[#13221D] outline-none focus:border-[#1E5646]" />
            </label>
          </div>

          {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-xl border border-[#D3E7DE] bg-[#E6F2EE] px-3.5 py-3 text-xs font-semibold text-[#1E5646]">{notice}</p>}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8E5] pt-5">
            <p className="max-w-sm text-[11px] leading-5 text-[#4A5D56]">New banners are saved inactive. Preview them first, then activate when approved.</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setPreviewAd(null); setIsPreviewOpen(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#1E5646] bg-white px-3.5 py-2 text-xs font-bold text-[#1E5646] transition hover:bg-[#E6F2EE]">
                <Eye size={15} /> Preview banner
              </button>
              <button type="submit" disabled={isSaving} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1E5646] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#174536] disabled:opacity-60">
                <Plus size={15} /> {isSaving ? "Saving..." : "Save draft"}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#13221D]">Live preview</h2>
              <p className="mt-1 text-xs text-[#4A5D56]">This is how the image banner will appear on ExOwn.</p>
            </div>
            <span className="rounded-full bg-[#E6F2EE] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#1E5646]">Draft</span>
          </div>
          <div className="relative isolate flex min-h-[260px] overflow-hidden rounded-2xl border border-[#E2E8E5] bg-[#14231C] shadow-[0_2px_8px_rgba(19,34,29,0.05)]">
            <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10251C] via-[#10251C]/90 to-[#10251C]/15" />
            <div className="flex min-h-[260px] w-full flex-col items-start justify-between p-5 text-white">
              <div className="flex w-full items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">{form.sponsorName || "Sponsor name"}</p>
                  <span className="mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">Sponsored</span>
                </div>
                <span className="rounded-md border border-white/25 bg-black/20 px-2 py-1 text-[9px] font-black text-white">AD</span>
              </div>
              <div className="max-w-[80%]">
                <h3 className="text-2xl font-extrabold leading-tight text-white">{form.title || "Your banner headline"}</h3>
                <p className="mt-2 text-xs text-white/80">{form.placement} · {form.linkUrl || "Destination link"}</p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#1E5646]">Learn more <ArrowRightIcon /></span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#E2E8E5] bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#13221D]"><Monitor size={15} className="text-[#1E5646]" /> Desktop</div>
              <p className="mt-1 text-[11px] text-[#4A5D56]">Wide horizontal banner</p>
            </div>
            <div className="rounded-xl border border-[#E2E8E5] bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#13221D]"><Smartphone size={15} className="text-[#1E5646]" /> Mobile</div>
              <p className="mt-1 text-[11px] text-[#4A5D56]">Swipeable card layout</p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#13221D]">Saved banners</h2>
            <p className="mt-1 text-xs text-[#4A5D56]">Review drafts, then activate campaigns for the selected placement and dates.</p>
          </div>
          <span className="rounded-full border border-[#E2E8E5] bg-white px-3 py-1.5 text-[10px] font-bold text-[#4A5D56]">{ads.length} total</span>
        </div>

        {ads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C9D6D0] bg-white px-6 py-12 text-center">
            <Megaphone size={28} className="mx-auto text-[#1E5646]" />
            <h3 className="mt-3 text-sm font-bold text-[#13221D]">No saved ad banners yet</h3>
            <p className="mt-1 text-xs text-[#4A5D56]">Create a banner above. You can preview it before making it active.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {ads.map((ad) => (
              <article key={ad.id} className="flex gap-3 rounded-2xl border border-[#E2E8E5] bg-white p-3.5 shadow-[0_1px_3px_rgba(19,34,29,0.03)]">
                <img src={ad.imageUrl} alt="" className="h-24 w-32 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#E6F2EE] px-2 py-0.5 text-[9px] font-bold uppercase text-[#1E5646]">{ad.placement}</span>
                    <span className={ad.isActive ? "rounded-full bg-[#E6F2EE] px-2 py-0.5 text-[9px] font-bold text-[#1E5646]" : "rounded-full bg-[#F2F4F2] px-2 py-0.5 text-[9px] font-bold text-[#4A5D56]"}>
                      {ad.isActive ? "Active" : "Draft / paused"}
                    </span>
                  </div>
                  <h3 className="mt-2 truncate text-sm font-bold text-[#13221D]">{ad.title}</h3>
                  <p className="mt-0.5 truncate text-[11px] text-[#4A5D56]">{ad.sponsorName}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#4A5D56]"><CalendarDays size={12} /> {formatDate(ad.startDate)} – {formatDate(ad.endDate)}</span>
                    <button type="button" onClick={() => { setPreviewAd(ad); setIsPreviewOpen(true); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E2E8E5] px-2.5 py-1.5 text-[10px] font-bold text-[#1E5646] hover:bg-[#E6F2EE]"><Eye size={13} /> Preview</button>
                    <button type="button" onClick={() => handleToggle(ad)} className={ad.isActive ? "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E2E8E5] px-2.5 py-1.5 text-[10px] font-bold text-[#4A5D56] hover:bg-[#F7F9F8]" : "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#1E5646] px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#174536]"}>
                      {ad.isActive ? <><PauseCircle size={13} /> Pause</> : <><PlayCircle size={13} /> Activate</>}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10251C]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Ad banner preview" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsPreviewOpen(false); }}>
          <div className="w-full max-w-4xl rounded-3xl border border-[#E2E8E5] bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.25)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5646]">Preview mode</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13221D]">{previewAd ? "Saved banner preview" : "Homepage banner preview"}</h2>
              </div>
              <button type="button" onClick={() => setIsPreviewOpen(false)} aria-label="Close preview" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8E5] text-[#4A5D56] hover:bg-[#F7F9F8]"><X size={18} /></button>
            </div>
            <div className="relative isolate flex min-h-[250px] overflow-hidden rounded-2xl bg-[#14231C] sm:min-h-[320px]">
              <img src={previewImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10251C] via-[#10251C]/85 to-[#10251C]/10" />
              <div className="flex min-h-[250px] w-full flex-col items-start justify-between p-6 text-white sm:min-h-[320px] sm:p-10">
                <div className="flex w-full items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/85">{preview.sponsorName || "Sponsor name"}</p>
                    <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Sponsored</span>
                  </div>
                  <span className="rounded-md border border-white/25 bg-black/20 px-2.5 py-1.5 text-[10px] font-black text-white">AD</span>
                </div>
                <div className="max-w-xl">
                  <h3 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{preview.title || "Your banner headline"}</h3>
                  <p className="mt-3 text-sm text-white/85">{preview.placement} placement · {preview.linkUrl || "Destination link"}</p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#1E5646]">Learn more <ArrowRightIcon /></span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-[#4A5D56]">New campaigns are saved as drafts. Activate only after checking the image, headline, destination and campaign dates.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon() {
  return <span aria-hidden="true">→</span>;
}
