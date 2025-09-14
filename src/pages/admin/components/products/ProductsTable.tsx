import React, { useState } from 'react';
import { Product } from '../../../../services/adminService';
import { IOSButton } from '../../../../components/ios/IOSDesignSystemV2';
import { Eye, Pencil, Trash2, Check, X } from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
  onView: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  loading?: boolean;
  onQuickUpdate?: (id: string, fields: Partial<Pick<Product,'price'|'stock'|'is_active'>>) => Promise<void> | void;
}

const headerClass = 'px-4 py-2 text-left text-xs font-semibold tracking-wide text-gray-200 uppercase select-none';
const cellClass = 'px-4 py-2 text-sm text-gray-100';

export const ProductsTable: React.FC<ProductsTableProps> = ({ products, onView, onEdit, onDelete, loading, onQuickUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{price?: string; stock?: string}>({});
  const startEdit = (p: Product) => { setEditingId(p.id); setDraft({ price: String(p.price||0), stock: String(p.stock||0) }); };
  const cancelEdit = () => { setEditingId(null); setDraft({}); };
  const saveEdit = async (id: string) => {
    if (!onQuickUpdate) { cancelEdit(); return; }
    const priceNum = Number(draft.price?.replace(/[^0-9.]/g,'')) || 0;
    const stockNum = parseInt(draft.stock||'0',10) || 0;
    await onQuickUpdate(id, { price: priceNum, stock: stockNum });
    cancelEdit();
  };

  return (
    <div className="relative rounded-xl border border-pink-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-sm shadow-inner overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-pink-700/50">
        <table className="w-full min-w-[960px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
            <tr>
              <th className={`${headerClass} first:rounded-tl-xl`}>Nama</th>
              <th className={headerClass}>Kategori</th>
              <th className={headerClass}>Tier</th>
              <th className={headerClass}>Harga</th>
              <th className={headerClass}>Stok</th>
              <th className={headerClass}>Aktif</th>
              <th className={headerClass + ' hidden xl:table-cell'}>Dibuat</th>
              <th className={`${headerClass} text-right pr-6 last:rounded-tr-xl`}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 && Array.from({length:6}).map((_,i)=>(
              <tr key={i} className="animate-pulse">
                <td className={cellClass + ' font-medium'}><div className="h-4 w-32 bg-gray-700/40 rounded" /></td>
                <td className={cellClass}><div className="h-4 w-20 bg-gray-700/40 rounded" /></td>
                <td className={cellClass}><div className="h-4 w-16 bg-gray-700/40 rounded" /></td>
                <td className={cellClass}><div className="h-4 w-10 bg-gray-700/40 rounded" /></td>
                <td className={cellClass}><div className="h-5 w-10 bg-gray-700/40 rounded" /></td>
                <td className={cellClass + ' hidden xl:table-cell'}><div className="h-4 w-24 bg-gray-700/40 rounded" /></td>
                <td className={cellClass + ' text-right pr-6'}><div className="h-4 w-24 ml-auto bg-gray-700/40 rounded" /></td>
              </tr>
            ))}
            {!loading && products.map(p => (
              <tr key={p.id} className="border-t border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                <td className={`${cellClass} font-medium whitespace-nowrap max-w-[220px]`}> 
                  <div className="flex flex-col">
                    <span className="truncate text-white/90">{p.name}</span>
                    <span className="text-[11px] text-gray-400 truncate max-w-[200px]">{p.description || '—'}</span>
                  </div>
                </td>
                <td className={cellClass}><span className="inline-flex px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 text-[11px] font-medium capitalize">{(p as any).categoryData?.name || (p as any).category || '—'}</span></td>
                <td className={cellClass}>
                  { (p as any).tiers ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shadow-sm border border-white/10"
                      style={{
                        background: (p as any).tiers.background_gradient || 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
                        color: '#fff'
                      }}
                      title={(p as any).tiers.name}
                    >
                      {(p as any).tiers.name || (p as any).tiers.slug}
                    </span>
                  ) : <span className="text-[11px] text-gray-500">—</span> }
                </td>
                <td className={cellClass}>
                  {editingId === p.id ? (
                    <input
                      autoFocus
                      value={draft.price||''}
                      onChange={e=>setDraft(d=>({...d,price:e.target.value}))}
                      onKeyDown={(e)=>{ if(e.key==='Enter') saveEdit(p.id); if(e.key==='Escape') cancelEdit(); }}
                      className="form-control control-h-lg w-28 text-xs px-2"
                    />
                  ) : (
                    <button onClick={()=>startEdit(p)} className="text-left text-pink-200 hover:text-pink-300 focus:outline-none">
                      Rp {Number(p.price||0).toLocaleString()}
                    </button>
                  )}
                </td>
                <td className={cellClass}>
                  {editingId === p.id ? (
                    <input
                      value={draft.stock||''}
                      onChange={e=>setDraft(d=>({...d,stock:e.target.value.replace(/[^0-9]/g,'')}))}
                      onKeyDown={(e)=>{ if(e.key==='Enter') saveEdit(p.id); if(e.key==='Escape') cancelEdit(); }}
                      className="form-control control-h-lg w-20 text-xs px-2"
                    />
                  ) : (
                    <button onClick={()=>startEdit(p)} className={`text-left ${p.stock && p.stock>0 ? 'text-green-400' : 'text-red-400'} hover:opacity-80`}>{p.stock ?? 0}</button>
                  )}
                </td>
                <td className={cellClass}>
                  <button
                    onClick={()=> onQuickUpdate && onQuickUpdate(p.id,{ is_active: !p.is_active })}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors border ${p.is_active ? 'bg-green-500/15 text-green-300 border-green-600/30 hover:bg-green-500/25' : 'bg-gray-700/30 text-gray-300 border-gray-600/40 hover:bg-gray-600/40'}`}
                    aria-pressed={p.is_active}
                    aria-label={p.is_active ? 'Deactivate product' : 'Activate product'}
                  >
                    {p.is_active ? <Check className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                    {p.is_active ? 'Ya' : 'Tidak'}
                  </button>
                </td>
                <td className={cellClass + ' hidden xl:table-cell'}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                <td className={cellClass + ' text-right pr-6 whitespace-nowrap'}>
                  {editingId === p.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <IOSButton size="sm" variant="primary" onClick={()=>saveEdit(p.id)} className="!px-3 h-7 bg-gradient-to-r from-pink-500 to-fuchsia-600">Simpan</IOSButton>
                      <IOSButton size="sm" variant="ghost" onClick={cancelEdit} className="!px-3 h-7 border border-gray-600/50">Batal</IOSButton>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <IOSButton size="sm" variant="ghost" onClick={()=>onView(p)} className="!px-2 h-7 border border-gray-600/40 hover:border-pink-500/50 hover:bg-pink-500/10"><Eye className="w-3.5 h-3.5"/></IOSButton>
                      <IOSButton size="sm" variant="ghost" onClick={()=>onEdit(p)} className="!px-2 h-7 border border-gray-600/40 hover:border-pink-500/50 hover:bg-pink-500/10"><Pencil className="w-3.5 h-3.5"/></IOSButton>
                      <IOSButton size="sm" variant="ghost" onClick={()=>onDelete(p)} className="!px-2 h-7 border border-red-600/40 text-red-300 hover:border-red-500/70 hover:bg-red-600/10"><Trash2 className="w-3.5 h-3.5"/></IOSButton>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                      <Pencil className="w-6 h-6 text-pink-400" />
                    </div>
                    <p className="text-sm text-gray-300">Tidak ada produk cocok dengan filter.</p>
                    <p className="text-xs text-gray-500">Ubah pencarian, kategori, atau status untuk melihat hasil.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;