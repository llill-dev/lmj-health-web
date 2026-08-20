export type RadiologyCatalogTab =
  | 'favorites'
  | 'recent'
  | 'devices'
  | 'lab'
  | 'manual';

export type RadiologyManualForm = {
  name: string;
  type: string;
  bodyArea: string;
  side: string;
  position: string;
  notes: string;
};

export type RadiologyClinicalForm = {
  urgency: string;
  clinicalReason: string;
  instructionsToPatient: string;
  imagingCenterInstructions: string;
  /** تحاليل مخبرية — يُرسل ضمن labInstructions عند الحفظ */
  requiresFasting?: boolean;
};

export type RadiologyOrderItemUi = {
  id: string;
  name: string;
  category: string;
  type: string;
  bodyArea: string;
  side: string;
  position: string;
  notes: string;
  catalogItemId?: string;
};
