import { Component, inject, computed, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusquedaEstadisticaFacade } from '../../facades/busquedaEstadistica.facade';
import { TableRow, ChartSlice } from '../../../../../core/models/estadisticas';

@Component({
  selector: 'app-tabla-anidada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tablaAnidada.component.html',
})
export class TablaAnidadaComponent {
  readonly facade = inject(BusquedaEstadisticaFacade);
  filaClic = output<TableRow>();
  filaActiva = input<TableRow | null>(null);
  abierto = true;

  // 1️⃣ Signal para almacenar qué jerarquías han sido colapsadas por el usuario
  collapsedGroups = signal<Set<string>>(new Set());

  toggle(): void {
    this.abierto = !this.abierto;
  }

  onRowClick(row: TableRow): void {
    this.filaClic.emit(row);
  }

  celdaClic = output<{ data: ChartSlice[]; title: string }>();

  onCeldaClick(data: ChartSlice[], title: string): void {
    this.celdaClic.emit({ data, title });
  }

  // 2️⃣ Método para alternar el estado de colapso de una celda específica
  toggleColapso(row: any, nivel: 'sala' | 'anio' | 'mes' | 'nom' | 'ape'): void {
    const set = new Set(this.collapsedGroups());
    let key = '';

    // Construimos una llave única basada en la jerarquía de la fila
    if (nivel === 'sala') key = `S:${row._sala}`;
    if (nivel === 'anio') key = `A:${row._sala}|${row._anio}`;
    if (nivel === 'mes') key = `M:${row._sala}|${row._anio}|${row._mes}`;
    if (nivel === 'nom') key = `N:${row._sala}|${row._anio}|${row._mes}|${row._nom}`;
    if (nivel === 'ape') key = `P:${row._sala}|${row._anio}|${row._mes}|${row._nom}|${row._ape}`;

    if (set.has(key)) {
      set.delete(key);
    } else {
      set.add(key);
    }

    // Al actualizar el signal, el 'computed' de tableData se volverá a ejecutar automáticamente
    this.collapsedGroups.set(set);
  }

  public tableData = computed(() => {
    // Usamos any localmente para poder inyectar propiedades de seguimiento dinámicas sin error de TS
    const rows: any[] = [];
    let totalGeneral = 0;
    const data = this.facade.dataJerarquica();

    if (!data || data.length === 0) return { rows, totalGeneral };

    // --- PASO 1: Generación base de datos (Tu lógica original con metadata extra) ---
    for (const salaData of data) {
      const salaRows: any[] = [];
      const salaChart: ChartSlice[] = Object.entries(salaData.anios).map(
        ([anioStr, anioData]) => ({ label: anioStr, value: anioData.total })
      );

      for (const [anioStr, anioData] of Object.entries(salaData.anios)) {
        const anioRows: any[] = [];
        const anioChart: ChartSlice[] = Object.entries(anioData.meses).map(
          ([mesStr, mesData]) => ({ label: mesStr, value: mesData.total })
        );

        for (const [mesStr, mesData] of Object.entries(anioData.meses)) {
          const mesRows: any[] = [];
          const mesChart: ChartSlice[] = Object.entries(mesData.nomenclaturas).map(
            ([nomStr, nomData]) => ({ label: nomStr, value: nomData.total })
          );

          for (const [nomStr, nomData] of Object.entries(mesData.nomenclaturas)) {
            const nomRows: any[] = [];
            const nomChart: ChartSlice[] = Object.entries(nomData.apelaciones).map(
              ([apeStr, apeData]) => ({ label: apeStr, value: apeData.total })
            );

            for (const [apeStr, apeData] of Object.entries(nomData.apelaciones)) {
              const apeRows: any[] = [];
              const apeChart: ChartSlice[] = Object.entries(apeData.tipos).map(
                ([tipoStr, tipoData]) => ({ label: tipoStr, value: tipoData.total })
              );
              const apeTitle = `${salaData.sala} | ${anioStr} | ${mesStr} | ${nomStr} | ${apeStr}`;

              for (const [tipoStr, tipoData] of Object.entries(apeData.tipos)) {
                apeRows.push({
                  isData: true,
                  tipo: tipoStr,
                  total: tipoData.total,
                  chartData: apeChart,
                  chartTitle: apeTitle,
                  clickLevel: 'tipo',
                  // 3️⃣ Inyectamos jerarquía a las filas de datos
                  _sala: salaData.sala, _anio: anioStr, _mes: mesStr, _nom: nomStr, _ape: apeStr
                });
              }

              if (apeRows.length > 0) {
                apeRows[0].ape = apeStr;
                apeRows[0].apeRowspan = apeRows.length;
                apeRows[0].apeChartData = apeChart;
                apeRows[0].apeChartTitle = apeTitle;
              }

              if (Object.keys(apeData.tipos).length > 1) {
                apeRows.push({
                  isSubtotal: true, level: 5,
                  label: `${apeStr} TOTAL`, total: apeData.total,
                  chartData: apeChart, chartTitle: apeTitle,
                  // Inyectamos jerarquía a subtotales de Apelación
                  _sala: salaData.sala, _anio: anioStr, _mes: mesStr, _nom: nomStr, _ape: apeStr
                });
              }

              nomRows.push(...apeRows);
            }

            if (nomRows.length > 0) {
              nomRows[0].nom = nomStr;
              nomRows[0].nomRowspan = nomRows.length;
              nomRows[0].nomChartData = nomChart;
              nomRows[0].nomChartTitle = `${salaData.sala} | ${anioStr} | ${mesStr} | ${nomStr}`;
            }

            if (Object.keys(nomData.apelaciones).length > 1) {
              nomRows.push({
                isSubtotal: true, level: 4,
                label: `${nomStr} TOTAL`, total: nomData.total,
                chartData: nomChart, chartTitle: `${salaData.sala} | ${anioStr} | ${mesStr} | ${nomStr}`,
                // 3️⃣ En este nivel de subtotal, NO incluimos _ape porque pertenece a Nomenclatura global
                _sala: salaData.sala, _anio: anioStr, _mes: mesStr, _nom: nomStr
              });
            }

            mesRows.push(...nomRows);
          }

          if (mesRows.length > 0) {
            mesRows[0].mes = mesStr;
            mesRows[0].mesRowspan = mesRows.length;
            mesRows[0].mesChartData = mesChart;
            mesRows[0].mesChartTitle = `${salaData.sala} | ${anioStr} | ${mesStr}`;
          }

          if (Object.keys(mesData.nomenclaturas).length > 1) {
            mesRows.push({
              isSubtotal: true, level: 3,
              label: `${mesStr} TOTAL`, total: mesData.total,
              chartData: mesChart, chartTitle: `${salaData.sala} | ${anioStr} | ${mesStr}`,
               // En este nivel de subtotal, solo llegamos hasta _mes
              _sala: salaData.sala, _anio: anioStr, _mes: mesStr
            });
          }

          totalGeneral += mesData.total;
          anioRows.push(...mesRows);
        }

        if (anioRows.length > 0) {
          anioRows[0].anio = anioStr;
          anioRows[0].anioRowspan = anioRows.length;
          anioRows[0].anioChartData = anioChart;
          anioRows[0].anioChartTitle = `${salaData.sala} | ${anioStr}`;
        }

        salaRows.push(...anioRows);
      }

      if (salaRows.length > 0) {
        salaRows[0].sala = salaData.sala;
        salaRows[0].salaRowspan = salaRows.length;
        salaRows[0].salaChartData = salaChart;
        salaRows[0].salaChartTitle = salaData.sala;
      }

      rows.push(...salaRows);
    }

    // --- PASO 2: Algoritmo de Visibilidad y Recálculo de Rowspans ---
    const collapsed = this.collapsedGroups();

    // Punteros para llevar la cuenta de la cabecera activa en cada nivel
    let cSala: any = null, cAnio: any = null, cMes: any = null, cNom: any = null, cApe: any = null;

    for (const row of rows) {
      // Limpiamos los punteros si la fila actual pertenece a un nivel superior (ej. un subtotal)
      if (!row._ape) cApe = null;
      if (!row._nom) cNom = null;
      if (!row._mes) cMes = null;
      if (!row._anio) cAnio = null;
      if (!row._sala) cSala = null;

      // Si la fila marca el inicio de una agrupación, iniciamos su rastreo
      if (row.salaRowspan) { cSala = row; cSala._calcSalaSpan = 0; cSala.salaColapsado = collapsed.has(`S:${row._sala}`); }
      if (row.anioRowspan) { cAnio = row; cAnio._calcAnioSpan = 0; cAnio.anioColapsado = collapsed.has(`A:${row._sala}|${row._anio}`); }
      if (row.mesRowspan) { cMes = row; cMes._calcMesSpan = 0; cMes.mesColapsado = collapsed.has(`M:${row._sala}|${row._anio}|${row._mes}`); }
      if (row.nomRowspan) { cNom = row; cNom._calcNomSpan = 0; cNom.nomColapsado = collapsed.has(`N:${row._sala}|${row._anio}|${row._mes}|${row._nom}`); }
      if (row.apeRowspan) { cApe = row; cApe._calcApeSpan = 0; cApe.apeColapsado = collapsed.has(`P:${row._sala}|${row._anio}|${row._mes}|${row._nom}|${row._ape}`); }

      // 4️⃣ Definir si la fila entera debe ocultarse
      let oculto = false;

      // Se oculta si su grupo padre está colapsado Y la fila NO es la cabecera misma de ese grupo
      if (cSala?.salaColapsado && row !== cSala) oculto = true;
      else if (cAnio?.anioColapsado && row !== cAnio) oculto = true;
      else if (cMes?.mesColapsado && row !== cMes) oculto = true;
      else if (cNom?.nomColapsado && row !== cNom) oculto = true;
      else if (cApe?.apeColapsado && row !== cApe) oculto = true;

      row.oculto = oculto;

      // 5️⃣ Si la fila NO está oculta, aumentamos dinámicamente el rowspan del bloque contenedor
if (!oculto) {
        if (cSala) cSala._calcSalaSpan++;
        if (cAnio) cAnio._calcAnioSpan++;

        // Evitamos que el rowspan cubra la fila de su propio subtotal (o niveles superiores).
        // Esto libera el espacio para que el HTML coloque el total en la columna correcta.
        if (cMes && !(row.isSubtotal && row.level <= 3)) cMes._calcMesSpan++;
        if (cNom && !(row.isSubtotal && row.level <= 4)) cNom._calcNomSpan++;
        if (cApe && !(row.isSubtotal && row.level <= 5)) cApe._calcApeSpan++;
      }
    }

    // --- PASO 3: Sobreescribimos los Rowspans originales por los recalculados ---
    for (const row of rows) {
      if (row.salaRowspan) row.salaRowspan = row._calcSalaSpan;
      if (row.anioRowspan) row.anioRowspan = row._calcAnioSpan;
      if (row.mesRowspan) row.mesRowspan = row._calcMesSpan;
      if (row.nomRowspan) row.nomRowspan = row._calcNomSpan;
      if (row.apeRowspan) row.apeRowspan = row._calcApeSpan;
    }

    return { rows: rows as TableRow[], totalGeneral };
  });

}
