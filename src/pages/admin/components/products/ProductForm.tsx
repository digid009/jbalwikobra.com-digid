import React from 'react';
import { GameTitle, Tier } from '../../../../types';
import { formatNumberID, parseNumberID } from '../../../../utils/helpers';
import { adminInputBase, cx } from '../ui/InputStyles';
import { t } from '../../../../i18n/strings';
import ImageUploader from '../../../../components/ImageUploader';
import { uploadFiles } from '../../../../services/storageService';

type FormState = {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category?: string;
  gameTitleId?: string;
  tierId?: string;
  images: string[];
  rentals: { id?: string; duration: string; price: number; description?: string }[];
};

interface ProductFormProps {
  form: FormState;
  games: GameTitle[];
  tiers: Tier[];
  saving: boolean;
  onFormChange: (form: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  form,
  games,
  tiers,
  saving,
  onFormChange,
  onSave,
  onCancel,
}) => {
  const updateForm = (updates: Partial<FormState>) => {
    onFormChange({ ...form, ...updates });
  };

  return (
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg bg-surface-glass-light border border-surface-tint-light">
      <div className="space-y-stack-md">
        {/* Header */}
        <div className="border-b border-surface-tint-light pb-stack-sm">
          <h3 className="text-xl font-bold text-ds-text">
            {form.id ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <p className="text-sm text-ds-text-secondary mt-1">
            {form.id ? 'Perbarui informasi produk' : 'Lengkapi form di bawah untuk menambah produk'}
          </p>
        </div>

        {/* Basic Information */}
        <div className="space-y-stack-sm">
          <h4 className="text-lg font-semibold text-ds-text">Informasi Dasar</h4>
          
          <div className="space-y-cluster-md">
            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">
                Nama Produk *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm({ name: e.target.value })}
                placeholder="Masukkan nama produk"
                className={cx(adminInputBase, 'px-3 py-2 w-full')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                placeholder="Deskripsi produk"
                rows={3}
                className={cx(adminInputBase, 'px-3 py-2 w-full resize-none')}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-stack-sm">
          <h4 className="text-lg font-semibold text-ds-text">Harga</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-cluster-md">
            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">
                Harga Jual *
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.price ? formatNumberID(form.price) : ''}
                onChange={(e) => updateForm({ price: parseNumberID(e.target.value) })}
                placeholder="0"
                className={cx(adminInputBase, 'px-3 py-2 w-full')}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">
                Harga Asli (opsional)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.originalPrice ? formatNumberID(form.originalPrice) : ''}
                onChange={(e) => updateForm({ originalPrice: parseNumberID(e.target.value) })}
                placeholder="0"
                className={cx(adminInputBase, 'px-3 py-2 w-full')}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-stack-sm">
          <h4 className="text-lg font-semibold text-ds-text">Kategori</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-cluster-md">
            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">
                Game
              </label>
              <select 
                value={form.gameTitleId || ''} 
                onChange={(e) => updateForm({ gameTitleId: e.target.value })} 
                className={cx(adminInputBase, 'px-3 py-2 w-full')}
              >
                <option value="">-- Pilih Game --</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">
                Tier
              </label>
              <select 
                value={form.tierId || ''} 
                onChange={(e) => updateForm({ tierId: e.target.value })} 
                className={cx(adminInputBase, 'px-3 py-2 w-full')}
              >
                <option value="">-- Pilih Tier --</option>
                {tiers.map(tier => (
                  <option key={tier.id} value={tier.id}>{tier.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-stack-sm">
          <h4 className="text-lg font-semibold text-ds-text">Gambar Produk</h4>
          
          <ImageUploader
            images={form.images}
            onChange={(imgs) => updateForm({ images: imgs })}
            onUpload={async (files, onProgress) => {
              const results = await uploadFiles(files, 'products', onProgress);
              return results.map(result => result.url).filter(Boolean);
            }}
            max={15}
          />
          <p className="text-xs text-ds-text-tertiary">
            Urutkan dengan drag & drop. Gambar pertama menjadi cover.
          </p>
        </div>

        {/* Rental Options */}
        <div className="space-y-stack-sm">
          <h4 className="text-lg font-semibold text-ds-text">Opsi Rental</h4>
          
          <div className="space-y-cluster-sm">
            {(form.rentals || []).map((rental, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 items-start">
                <input 
                  className={cx(adminInputBase, 'col-span-2 px-2 py-1')} 
                  placeholder="Durasi (mis. 1 Hari)" 
                  value={rental.duration} 
                  onChange={(e) => {
                    const next = [...form.rentals]; 
                    next[idx] = { ...rental, duration: e.target.value }; 
                    updateForm({ rentals: next });
                  }} 
                />
                <input
                  type="text"
                  inputMode="numeric"
                  className={cx(adminInputBase, 'col-span-2 px-2 py-1')}
                  placeholder="Rp 0"
                  value={rental.price ? `Rp ${formatNumberID(rental.price)}` : ''}
                  onChange={(e) => {
                    const next = [...form.rentals]; 
                    next[idx] = { ...rental, price: parseNumberID(e.target.value) }; 
                    updateForm({ rentals: next });
                  }}
                />
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    const next = [...form.rentals]; 
                    next.splice(idx, 1); 
                    updateForm({ rentals: next });
                  }}
                >
                  Hapus
                </button>
                <input 
                  className={cx(adminInputBase, 'col-span-5 px-2 py-1')} 
                  placeholder="Deskripsi (opsional)" 
                  value={rental.description || ''} 
                  onChange={(e) => {
                    const next = [...form.rentals]; 
                    next[idx] = { ...rental, description: e.target.value }; 
                    updateForm({ rentals: next });
                  }} 
                />
              </div>
            ))}
            
            <button 
              className="btn btn-ghost"
              onClick={() => updateForm({ 
                rentals: [...(form.rentals || []), { duration: '', price: 0 }] 
              })}
            >
              Tambah Rental
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-cluster-sm pt-stack-sm border-t border-surface-tint-light">
          <button onClick={onCancel} className="btn btn-ghost btn-sm">
            {t('common.cancel')}
          </button>
          <button onClick={onSave} className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
