import { Component, OnInit, Input, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { ITrack } from '../interfaces/track.interface';

@Component({
  selector: 'bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit, OnChanges {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef;
  @Input() data: ITrack[] = [];
  @Input() filtersEnabled: boolean = false; // Permet habilitar/deshabilitar filtres
  @Input() popularity: number = 50;

  filteredData: ITrack[] = [];

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['popularity'] || changes['filtersEnabled']) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    if (this.filtersEnabled) {
      this.filteredData = this.data.filter(
        (track) => track.popularity >= this.popularity
      );
    } else {
      this.filteredData = [...this.data];
    }
    this.createChart();
  }

  createChart(): void {
    const element = this.chartContainer.nativeElement;
    const margin = { top: 20, right: 20, bottom: 70, left: 50 };
    const width = 625 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const genreCounts = this.filteredData.reduce((acc, track) => {
      acc[track.track_genre] = (acc[track.track_genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const genres = Object.keys(genreCounts);
    const counts = Object.values(genreCounts);

    d3.select(element).select('svg').remove();

    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand().domain(genres).range([0, width]).padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(counts) || 0])
      .range([height, 0]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(() => ''));

    svg.append('g').call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .text('Gèneres Musicals');

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .text('Nombre de Cançons');

    svg
      .selectAll('.bar')
      .data(genres)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d)!)
      .attr('y', (d) => yScale(genreCounts[d]))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(genreCounts[d]))
      .attr('fill', '#69b3a2');
  }
}
