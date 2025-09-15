import React from 'react';
// Replaced IOSToggle with native checkbox styled for DS

export interface RentalValues {
  is_active: boolean; is_rental: boolean; rental_duration_hours: number; rental_unit: string; rental_price_per_hour: number; rental_deposit: number;
}
interface SettingsRentalProps {
  values: RentalValues;
  onChange: (patch: Partial<RentalValues>) => void;
}
export const SettingsRentalSection: React.FC<SettingsRentalProps> = ({ values, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Settings & Options</h3>
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={values.is_active} onChange={e=>onChange({ is_active: e.target.checked })} className="form-checkbox h-4 w-4 text-blue-500" />
          <span className="text-sm">Active Product</span>
          <span className="ml-2 text-xs text-white/60">Uncheck to create as draft</span>
        </label>
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={values.is_rental} onChange={e=>onChange({ is_rental: e.target.checked })} className="form-checkbox h-4 w-4 text-blue-500" />
          <span className="text-sm">Enable Rental Option</span>
          <span className="ml-2 text-xs text-white/60">Allow customers to rent this account temporarily</span>
        </label>
      </div>
      {values.is_rental && (
        <div className="space-y-3 mt-6">
          <h4 className="text-sm font-semibold text-white">Rental Variation</h4>
          <div className="p-4 bg-black rounded-xl border border-gray-700 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Duration</label>
                <input type="number" value={values.rental_duration_hours} min={1} onChange={e=>onChange({ rental_duration_hours: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-black focus:ring-1 focus:ring-blue-500 focus:border-pink-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Unit</label>
                <select value={values.rental_unit} onChange={e=>onChange({ rental_unit: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-black focus:ring-1 focus:ring-blue-500 focus:border-pink-500">
                  <option value="Hours">Hours</option>
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Price</label>
                <input type="number" value={values.rental_price_per_hour} min={0} onChange={e=>onChange({ rental_price_per_hour: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-black focus:ring-1 focus:ring-blue-500 focus:border-pink-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1">Deposit</label>
              <input type="number" value={values.rental_deposit} min={0} onChange={e=>onChange({ rental_deposit: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-black focus:ring-1 focus:ring-blue-500 focus:border-pink-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsRentalSection;
export {};
