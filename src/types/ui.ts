// Menu type
export type Menu = {
  id: number;
  title: string;
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
};

// Category type
export type Category = {
  title: string;
  id: number;
  img: string;
};


// Testimonial type
export type Testimonial = {
  review: string;
  authorName: string;
  authorRole: string;
  authorImg: string;
};

// Blog Item type
export type BlogItemType = {
  date: string;
  views: number;
  title: string;
  img: string;
};

// Preview Slider Context type
export interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  openPreviewModal: () => void;
  closePreviewModal: () => void;
}
