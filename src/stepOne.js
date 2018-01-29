import * as d3 from 'd3';
import 'styles.styl';
import dataAsStringRu from 'rudata';

/*
 ONLY CHART
 */

d3.timeFormatDefaultLocale({
  'dateTime': '%A, %e %B %Y г. %X',
  'date': '%d.%m.%Y',
  'time': '%H:%M:%S',
  'periods': ['AM', 'PM'],
  'days': ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  'shortDays': ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  'months': ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  'shortMonths': ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
});

const data = d3.csvParse(dataAsStringRu, d => d);

export default function draw() {
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 920 - margin.left - margin.right;
  const height = 360 - margin.top - margin.bottom;

  const x = d3.scaleTime()
    .range([0, width]);

  const y = d3.scaleLinear()
    .range([height, 0]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory20);

  const svg = d3.select('.chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${ margin.left },${ margin.top })`);

  data.forEach(function (d) {
    d.date = new Date(d.date);
    d.percent = +d.percent;
  });

  x.domain(d3.extent(data, d => d.date));
  y.domain(d3.extent(data, d => d.percent));
  colorScale.domain(d3.map(data, d => d.regionId).keys());

  const xAxis = d3.axisBottom(x)
    .ticks((width + 2) / (height + 2) * 5)
    .tickSize(-height)
    .tickPadding(10);

  const yAxis = d3.axisRight(y)
    .ticks(5)
    .tickSize(width)
    .tickPadding(-20 - width);

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${ height })`)
    .call(xAxis);

  svg.append('g')
    .attr('class', 'axis')
    .call(yAxis);

  svg.append('g')
    .attr('transform', `translate(0,${ height })`)
    .call(d3.axisBottom(x).ticks(0));

  svg.append('g')
    .call(d3.axisLeft(y).ticks(0));

  const nestByRegionId = d3.nest()
    .key(d => d.regionId)
    .sortKeys((v1, v2) => (parseInt(v1, 10) > parseInt(v2, 10) ? 1 : -1))
    .entries(data);

  const regions = {};

  d3.map(data, d => d.regionId)
    .keys()
    .forEach(function (d, i) {
      regions[d] = nestByRegionId[i].values;
    });

  const regionIds = Object.keys(regions);

  const lineGenerator = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.percent));

  svg
    .selectAll('.line')
    .data(regionIds)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('id', regionId => `region-${ regionId }`)
    .attr('d', regionId => lineGenerator(regions[regionId]))
    .style('stroke', regionId => colorScale(regionId));
}
