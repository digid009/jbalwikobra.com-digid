import { Banner } from '../../../../services/adminService';

export interface BannerFormData {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  cta_text: string;
  sort_order: number;
  is_active: boolean;
}

export interface BannerTableProps {
  banners: Banner[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onToggleStatus: (bannerId: string, currentStatus: boolean) => void;
  onDeleteBanner: (bannerId: string) => void;
  onEditBanner: (banner: Banner) => void;
  onImagePreview: (imageUrl: string) => void;
}

export interface BannerFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingBanner: Banner | null;
  onSubmit: (formData: BannerFormData) => void;
  submitting: boolean;
}

export interface BannerSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface BannerHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onCreateBanner: () => void;
}

export interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}
