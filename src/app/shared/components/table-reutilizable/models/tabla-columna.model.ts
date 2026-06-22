export interface TablaColumna {
  field: string;
  label: string;
  visible: boolean;
  type?: 'text' | 'checkbox' | 'date';
  dateFormat?: string;
  cellClass?: string | ((value: any, row: any) => string);
}
