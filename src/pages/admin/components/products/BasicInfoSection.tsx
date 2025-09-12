import React from 'react';
import { adminInputBase } from '../ui/InputStyles';
import { cn } from '../../../../styles/standardClasses';

export interface BasicInfoValues {
  name: string; description: string; price: number; original_price: number; stock: number;
}
interface BasicInfoProps {
  values: BasicInfoValues;
  onChange: (patch: Partial<BasicInfoValues>) => void;
}
export const BasicInfoSection: React.FC<BasicInfoProps> = ({ values, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Basic Information</h3>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Product Name *</label>
        <input type="text" value={values.name} onChange={e=>onChange({ name: e.target.value })}
          className={adminInputBase.replace('px-3','px-4').replace('py-2','py-3').replace('rounded-2xl','rounded-xl')+ ' placeholder-ios-text-secondary'} placeholder="Enter product name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Description *</label>
        <textarea value={values.description} onChange={e=>onChange({ description: e.target.value })} rows={4}
          className={adminInputBase.replace('px-3','px-4').replace('py-2','py-3').replace('rounded-2xl','rounded-xl')+ ' placeholder-ios-text-secondary'} placeholder="Enter product description" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Price *</label>
          <input type="number" value={values.price} onChange={e=>onChange({ price: Number(e.target.value) })}
            className={adminInputBase.replace('px-3','px-4').replace('py-2','py-3').replace('rounded-2xl','rounded-xl')+ ' placeholder-ios-text-secondary'} placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Original Price</label>
          <input type="number" value={values.original_price} onChange={e=>onChange({ original_price: Number(e.target.value) })}
            className={adminInputBase.replace('px-3','px-4').replace('py-2','py-3').replace('rounded-2xl','rounded-xl')+ ' placeholder-ios-text-secondary'} placeholder="0" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Stock Quantity *</label>
        <input type="number" value={values.stock} min={0} onChange={e=>onChange({ stock: Math.max(0, Number(e.target.value)) })}
          className={cn('w-full px-4 py-3 rounded-xl border border-gray-700 bg-black','text-white placeholder-ios-text-secondary','focus:ring-2 focus:ring-ios-primary focus:border-pink-500')} placeholder="1" />
      </div>
    </div>
  );
};
export default BasicInfoSection;
