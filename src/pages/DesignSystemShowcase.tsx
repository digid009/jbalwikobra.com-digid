import React, { useState } from 'react';
import { standardClasses, cn } from '../styles/standardClasses';
import { 
  IOSContainer, 
  IOSCard, 
  IOSButton,
  // Future components (will be available when implemented):
  // IOSInput,
  // IOSSelect, 
  // IOSCheckbox,
  // IOSRadio,
  // IOSSwitch,
  // IOSSlider,
  // IOSTextarea,
  // IOSModal,
  // IOSTooltip,
  // IOSBadge,
  // IOSAlert,
  // IOSProgress,
  // IOSSpinner,
  // IOSAvatar,
  // IOSTabs,
  // IOSAccordion,
  // IOSDropdown,
  // IOSDatePicker,
  // IOSTimePicker,
  // IOSColorPicker,
  // IOSFileUpload,
  // IOSPagination,
  // IOSBreadcrumb,
  // IOSNavigation,
  // IOSTable,
  // IOSGrid,
  // IOSDialog,
  // IOSPopover,
  // IOSSidebar,
  // IOSDrawer,
  // IOSBottomSheet,
  // IOSActionSheet
} from '../components/ios/IOSDesignSystem';

// Temporary placeholder components for future implementation
const PlaceholderComponent: React.FC<{ name: string; description: string; children?: React.ReactNode }> = ({ name, description, children }) => (
  <div className="border-2 border-dashed border-ios-border rounded-lg p-4 bg-ios-surface/50">
    <div className="text-center space-y-2">
      <h4 className="font-semibold text-ios-text">{name}</h4>
      <p className="text-sm text-ios-text-secondary">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  </div>
);

const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <IOSContainer className="py-8">
      <div className={cn(standardClasses.container.boxed, 'space-y-8')}>
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-ios-text">iOS Design System Showcase</h1>
          <p className="text-ios-text-secondary text-lg">
            Complete component library and design patterns for consistent UI
          </p>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg inline-block">
            ⚠️ This page is hidden from search engines and navigation
          </div>
        </div>

        {/* Navigation Tabs */}
        <IOSCard>
          <div className="flex flex-wrap gap-2 p-2 bg-ios-background rounded-lg">
            {['overview', 'colors', 'typography', 'buttons', 'forms'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-ios-accent text-white' 
                    : 'text-ios-text-secondary hover:text-ios-text hover:bg-ios-surface'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </IOSCard>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <IOSCard>
            <h2 className="text-2xl font-bold text-ios-text mb-6">Design System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-ios-text">Implemented</h3>
                <ul className="text-sm text-ios-text-secondary space-y-1">
                  <li>✅ Buttons (Primary, Secondary, Ghost)</li>
                  <li>✅ Cards (Multiple padding options)</li>
                  <li>✅ Container (Responsive layout)</li>
                  <li>✅ Color Palette (iOS tokens)</li>
                  <li>✅ Typography Scale</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-ios-text">Future Components</h3>
                <ul className="text-sm text-ios-text-secondary space-y-1">
                  <li>🔄 Form Controls (Input, Select, etc.)</li>
                  <li>🔄 Navigation (Tabs, Breadcrumb)</li>
                  <li>🔄 Feedback (Alert, Toast, Progress)</li>
                  <li>🔄 Overlays (Modal, Dialog)</li>
                  <li>🔄 Data Display (Table, Grid)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-ios-text">Status Legend</h3>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-ios-text">✅ Available</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-ios-text">🔄 In Progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-dashed border-ios-border rounded"></div>
                    <span className="text-ios-text">📋 Planned</span>
                  </li>
                </ul>
              </div>
            </div>
          </IOSCard>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <IOSCard>
            <h2 className="text-2xl font-bold text-ios-text mb-6">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 bg-ios-accent rounded-lg shadow-sm"></div>
                <p className="text-sm font-medium text-ios-text">ios-accent</p>
                <p className="text-xs text-ios-text-secondary">Primary brand color</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-ios-background rounded-lg border border-ios-border"></div>
                <p className="text-sm font-medium text-ios-text">ios-background</p>
                <p className="text-xs text-ios-text-secondary">Main background</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-ios-surface rounded-lg"></div>
                <p className="text-sm font-medium text-ios-text">ios-surface</p>
                <p className="text-xs text-ios-text-secondary">Card backgrounds</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 border-2 border-ios-border rounded-lg"></div>
                <p className="text-sm font-medium text-ios-text">ios-border</p>
                <p className="text-xs text-ios-text-secondary">Border elements</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-ios-text rounded-lg"></div>
                <p className="text-sm font-medium text-ios-text">ios-text</p>
                <p className="text-xs text-ios-text-secondary">Primary text</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-ios-text-secondary rounded-lg"></div>
                <p className="text-sm font-medium text-ios-text">ios-text-secondary</p>
                <p className="text-xs text-ios-text-secondary">Secondary text</p>
              </div>
            </div>
          </IOSCard>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <IOSCard>
            <h2 className="text-2xl font-bold text-ios-text mb-6">Typography System</h2>
            <div className="space-y-4">
              <div className="border-b border-ios-border pb-4">
                <h1 className="text-4xl font-bold text-ios-text">Display Large</h1>
                <p className="text-sm text-ios-text-secondary mt-1">text-4xl font-bold</p>
              </div>
              <div className="border-b border-ios-border pb-4">
                <h2 className="text-3xl font-bold text-ios-text">Display Medium</h2>
                <p className="text-sm text-ios-text-secondary mt-1">text-3xl font-bold</p>
              </div>
              <div className="border-b border-ios-border pb-4">
                <h3 className="text-2xl font-semibold text-ios-text">Display Small</h3>
                <p className="text-sm text-ios-text-secondary mt-1">text-2xl font-semibold</p>
              </div>
              <div className="border-b border-ios-border pb-4">
                <p className="text-base text-ios-text">Body Large - Default paragraph text</p>
                <p className="text-sm text-ios-text-secondary mt-1">text-base</p>
              </div>
              <div>
                <p className="text-sm text-ios-text-secondary">Caption - Small text for metadata</p>
                <p className="text-xs text-ios-text-secondary mt-1">text-sm text-ios-text-secondary</p>
              </div>
            </div>
          </IOSCard>
        )}

        {/* Buttons Tab */}
        {activeTab === 'buttons' && (
          <IOSCard>
            <h2 className="text-2xl font-bold text-ios-text mb-6">Button Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-ios-text">Primary Buttons</h3>
                <div className="space-y-3">
                  <IOSButton variant="primary" size="large" className="w-full">Large Primary</IOSButton>
                  <IOSButton variant="primary" size="medium" className="w-full">Medium Primary</IOSButton>
                  <IOSButton variant="primary" size="small" className="w-full">Small Primary</IOSButton>
                  <IOSButton variant="primary" size="medium" disabled className="w-full">Disabled</IOSButton>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-ios-text">Secondary Buttons</h3>
                <div className="space-y-3">
                  <IOSButton variant="secondary" size="large" className="w-full">Large Secondary</IOSButton>
                  <IOSButton variant="secondary" size="medium" className="w-full">Medium Secondary</IOSButton>
                  <IOSButton variant="secondary" size="small" className="w-full">Small Secondary</IOSButton>
                  <IOSButton variant="secondary" size="medium" disabled className="w-full">Disabled</IOSButton>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-ios-text">Ghost Buttons</h3>
                <div className="space-y-3">
                  <IOSButton variant="ghost" size="large" className="w-full">Large Ghost</IOSButton>
                  <IOSButton variant="ghost" size="medium" className="w-full">Medium Ghost</IOSButton>
                  <IOSButton variant="ghost" size="small" className="w-full">Small Ghost</IOSButton>
                  <IOSButton variant="ghost" size="medium" disabled className="w-full">Disabled</IOSButton>
                </div>
              </div>
            </div>
          </IOSCard>
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <IOSCard>
            <h2 className="text-2xl font-bold text-ios-text mb-6">Form Components (Future)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PlaceholderComponent name="IOSInput" description="Text input with iOS styling">
                <input className="w-full px-3 py-2 bg-ios-background border border-ios-border rounded-lg text-ios-text focus:ring-2 focus:ring-ios-accent focus:border-transparent" placeholder="Text Input Preview" />
              </PlaceholderComponent>

              <PlaceholderComponent name="IOSSelect" description="Dropdown select with iOS styling">
                <select className="w-full px-3 py-2 bg-ios-background border border-ios-border rounded-lg text-ios-text focus:ring-2 focus:ring-ios-accent focus:border-transparent">
                  <option>Select Preview</option>
                </select>
              </PlaceholderComponent>

              <PlaceholderComponent name="IOSTextarea" description="Multi-line text input">
                <textarea className="w-full px-3 py-2 bg-ios-background border border-ios-border rounded-lg text-ios-text focus:ring-2 focus:ring-ios-accent focus:border-transparent" rows={3} placeholder="Textarea Preview"></textarea>
              </PlaceholderComponent>

              <PlaceholderComponent name="IOSCheckbox + IOSRadio" description="Form controls with iOS styling">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-ios-border text-ios-accent focus:ring-ios-accent" />
                    <span className="text-ios-text">Checkbox Preview</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" className="border-ios-border text-ios-accent focus:ring-ios-accent" />
                    <span className="text-ios-text">Radio Preview</span>
                  </label>
                </div>
              </PlaceholderComponent>
            </div>
          </IOSCard>
        )}

        {/* Component Status */}
        <IOSCard>
          <h2 className="text-2xl font-bold text-ios-text mb-4">Implementation Status</h2>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This showcase displays both implemented components and planned future components. 
              Dashed border components are placeholders showing intended design patterns for future implementation.
            </p>
          </div>
        </IOSCard>
      </div>
    </IOSContainer>
  );
};

export default DesignSystemShowcase;
