import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { OrderCatalogItem } from '@/lib/doctor/encounterOrderTypes';
import type { RadiologyCatalogTab } from './radiology-types';

const DEFAULT_TABS: { id: RadiologyCatalogTab; label: string }[] = [
  { id: 'favorites', label: 'المفضلة' },
  { id: 'devices', label: 'الأجهزة' },
  { id: 'lab', label: 'مختبري' },
  { id: 'manual', label: 'يدوي' },
];

const FALLBACK_CATALOG: OrderCatalogItem[] = [
  { _id: 'cbc', title: 'تحليل دم كامل (CBC)', category: 'دم' },
  { _id: 'kidney', title: 'وظائف الكلى', category: 'كيمياء' },
  { _id: 'liver', title: 'وظائف الكبد', category: 'كيمياء' },
  { _id: 'xray-chest', title: 'أشعة صدر', category: 'أشعة سينية' },
  { _id: 'ct-abd', title: 'أشعة مقطعية للبطن', category: 'CT' },
];

export function RadiologyCatalogPicker({
  items,
  loading,
  onAddCatalogItem,
  onOpenManual,
  onToggleFavorite,
  disabled,
  catalogSectionLabel = 'إضافة فحص',
  searchPlaceholder = 'بحث...',
  tabs = DEFAULT_TABS,
}: {
  items: OrderCatalogItem[];
  loading?: boolean;
  onAddCatalogItem: (item: OrderCatalogItem) => void;
  onOpenManual: () => void;
  onToggleFavorite?: (item: OrderCatalogItem) => void | Promise<void>;
  disabled?: boolean;
  catalogSectionLabel?: string;
  searchPlaceholder?: string;
  tabs?: Array<{ id: RadiologyCatalogTab; label: string }>;
}) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<RadiologyCatalogTab>(tabs[0]?.id ?? 'favorites');
  const [search, setSearch] = useState('');

  const source = items.length > 0 ? items : FALLBACK_CATALOG;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return source.filter((item) => {
      const title = (item.title ?? item.name ?? item.label ?? '').toLowerCase();
      const category = (item.category ?? '').toLowerCase();
      if (q && !title.includes(q) && !category.includes(q)) return false;
      if (tab === 'favorites') {
        return item.isFavorited === true || (!items.length && !q);
      }
      if (tab === 'recent') {
        return item.isFavorited !== true;
      }
      if (tab === 'manual') return false;
      if (tab === 'devices') return true;
      if (tab === 'lab') return true;
      return true;
    });
  }, [items.length, search, source, tab]);

  return (
    <section className="mb-6 overflow-hidden rounded-[12px] border border-[#E4E7EC] bg-white shadow-sm">
      <button
        type="button"
        dir="rtl"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-primary px-4 py-3 text-white"
      >
        <span className="flex min-w-0 flex-1 items-center justify-start gap-2">
          <span className="font-cairo text-[14px] font-extrabold">
            {catalogSectionLabel}
          </span>
          <Plus className="h-5 w-5 shrink-0" aria-hidden />
        </span>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 transition', open ? 'rotate-180' : '')}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="space-y-4 px-4 py-4">
          <label className="relative block" dir="rtl">
            <span className="sr-only">{searchPlaceholder}</span>
            <input
              type="search"
              dir="rtl"
              lang="ar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              disabled={disabled}
              className="h-11 w-full rounded-[10px] border border-[#E4E7EC] bg-[#F8FAFC] ps-3 pe-10 font-cairo text-[13px] font-semibold text-[#101828] outline-none focus:border-primary"
            />
            <Search
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
              aria-hidden
            />
          </label>

          <div
            className="flex flex-wrap gap-0 border-b border-[#E4E7EC]"
            role="tablist"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  if (t.id === 'manual') onOpenManual();
                }}
                disabled={disabled}
                role="tab"
                aria-selected={tab === t.id}
                className={cn(
                  'border-b-2 px-4 py-2.5 font-cairo text-[12px] font-extrabold transition',
                  tab === t.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-[#667085] hover:text-primary',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'manual' ? (
            <p className="text-center font-cairo text-[13px] font-semibold text-[#667085]">
              يتم فتح نموذج الإدخال اليدوي...
            </p>
          ) : loading ? (
            <p className="text-center font-cairo text-[13px] font-semibold text-primary">
              جارٍ تحميل الكتالوج...
            </p>
          ) : (
            <ul className="max-h-[240px] space-y-2 overflow-y-auto">
              {filtered.map((item) => {
                const title =
                  item.title ?? item.name ?? item.label ?? '—';
                return (
                  <li key={item._id}>
                    <div className="flex w-full items-center gap-2 rounded-[10px] border border-[#E4E7EC] bg-[#FAFBFC] px-3 py-3">
                      {onToggleFavorite ? (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => void onToggleFavorite(item)}
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border transition',
                            item.isFavorited
                              ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]'
                              : 'border-[#E4E7EC] bg-white text-[#98A2B3] hover:text-primary',
                          )}
                          aria-label={
                            item.isFavorited ? 'إزالة من المفضلة' : 'إضافة للمفضلة'
                          }
                        >
                          <Star
                            className={cn('h-4 w-4', item.isFavorited && 'fill-current')}
                            aria-hidden
                          />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onAddCatalogItem(item)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-right transition hover:opacity-90 disabled:opacity-60"
                      >
                        <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <div className="font-cairo text-[14px] font-extrabold text-[#101828]">
                            {title}
                          </div>
                          {item.category ? (
                            <div className="mt-0.5 font-cairo text-[11px] font-semibold text-[#667085]">
                              {item.category}
                            </div>
                          ) : null}
                        </div>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
