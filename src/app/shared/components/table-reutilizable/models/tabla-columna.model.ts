export interface TablaColumna {
  field: string;
  label: string;
  visible: boolean;
  type?: 'text' | 'checkbox';
  cellClass?: string | ((value: any, row: any) => string);
}
