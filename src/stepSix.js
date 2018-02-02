import * as d3 from 'd3';
import 'styles.styl';
import dataAsStringRu from 'rudata';

/*
 SHOW VALUE
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

const timeFormatter = d3.timeFormat('%d-%m-%Y');

const ENABLED_OPACITY = 1;
const DISABLED_OPACITY = .2;

function chunkHelper(data, numberOfChunks) { // eslint-disable-line
  const result = [];
  let remainingToDistribute = data.length;

  while (result.length < numberOfChunks) {
    const maxNumberOfElementsInChunk = Math.ceil(remainingToDistribute / (numberOfChunks - result.length));
    const currentlyDistributed = data.length - remainingToDistribute;
    const currentChunk = data.slice(currentlyDistributed, currentlyDistributed + maxNumberOfElementsInChunk);

    result.push(currentChunk);
    remainingToDistribute = remainingToDistribute - currentChunk.length;
  }

  return result;
}

export default function draw() {
  const margin = { top: 20, right: 20, bottom: 250, left: 50 };
  const width = 920 - margin.left - margin.right;
  const height = 390 - margin.top - margin.bottom;

  const ratio = 4;

  const previewWidth = width / ratio;
  const previewHeight = height / ratio;

  const x = d3.scaleTime()
    .range([0, width]);

  const y = d3.scaleLinear()
    .range([height, 0]);

  let rescaledX = x;
  let rescaledY = y;

  const previewX = d3.scaleTime()
    .range([0, previewWidth]);

  const previewY = d3.scaleLinear()
    .range([previewHeight, 0]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory20);

  const zoom = d3.zoom()
    .scaleExtent([0.95, 10])
    .translateExtent([[-100000, -100000], [100000, 100000]])
    .on('start', () => {
      hoverDot
        .attr('cx', -5)
        .attr('cy', 0);
    })
    .on('zoom', zoomed);

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
  previewX.domain(d3.extent(data, d => d.date));
  previewY.domain(d3.extent(data, d => d.percent));
  colorScale.domain(d3.map(data, d => d.regionId).keys());

  const xAxis = d3.axisBottom(x)
    .ticks((width + 2) / (height + 2) * 5)
    .tickSize(-height - 6)
    .tickPadding(10);

  const yAxis = d3.axisRight(y)
    .ticks(5)
    .tickSize(7 + width)
    .tickPadding(-15 - width)
    .tickFormat(d => d + '%');

  const xAxisElement = svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${ height + 6 })`)
    .call(xAxis);

  const yAxisElement = svg.append('g')
    .attr('transform', 'translate(-7, 0)')
    .attr('class', 'axis y-axis')
    .call(yAxis);

  svg.append('g')
    .attr('transform', `translate(0,${ height })`)
    .call(d3.axisBottom(x).ticks(0));

  svg.append('g')
    .call(d3.axisLeft(y).ticks(0));

  svg.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

  const nestByRegionId = d3.nest()
    .key(d => d.regionId)
    .sortKeys((v1, v2) => (parseInt(v1, 10) > parseInt(v2, 10) ? 1 : -1))
    .entries(data);

  const regionsNamesById = {};

  nestByRegionId.forEach(item => {
    regionsNamesById[item.key] = item.values[0].regionName;
  });

  const regions = {};

  d3.map(data, d => d.regionId)
    .keys()
    .forEach(function (d, i) {
      regions[d] = {
        data: nestByRegionId[i].values,
        enabled: true
      };
    });

  const regionsIds = Object.keys(regions);

  const lineGenerator = d3.line()
    .x(d => rescaledX(d.date))
    .y(d => rescaledY(d.percent))
    .curve(d3.curveCardinal);

  const nestByDate = d3.nest()
    .key(d => d.date)
    .entries(data);

  const percentsByDate = {};

  nestByDate.forEach(dateItem => {
    percentsByDate[dateItem.key] = {};

    dateItem.values.forEach(item => {
      percentsByDate[dateItem.key][item.regionId] = item.percent;
    });
  });

  const legendContainer = d3.select('.legend');

  const legendsSvg = legendContainer
    .append('svg');

  const legendsDate = legendsSvg.append('text')
    .attr('visibility', 'hidden')
    .attr('x', 0)
    .attr('y', 10);

  const legends = legendsSvg.attr('width', 210)
    .attr('height', 353)
    .selectAll('g')
    .data(regionsIds)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (regionId, index) => `translate(0,${ index * 20 + 20 })`)
    .on('click', clickLegendRectHandler);

  const legendsValues = legends
    .append('text')
    .attr('x', 0)
    .attr('y', 10)
    .attr('class', 'legend-value');

  legends.append('rect')
    .attr('x', 58)
    .attr('y', 0)
    .attr('width', 12)
    .attr('height', 12)
    .style('fill', regionId => colorScale(regionId))
    .select(function() { return this.parentNode; })
    .append('text')
    .attr('x', 78)
    .attr('y', 10)
    .text(regionId => regionsNamesById[regionId])
    .attr('class', 'legend-text')
    .style('text-anchor', 'start');

  const extraOptionsContainer = legendContainer.append('div')
    .attr('class', 'extra-options-container');

  extraOptionsContainer.append('div')
    .attr('class', 'hide-all-option')
    .text('скрыть все')
    .on('click', () => {
      regionsIds.forEach(regionId => {
        regions[regionId].enabled = false;
      });

      singleLineSelected = false;

      redrawChart();
    });

  extraOptionsContainer.append('div')
    .attr('class', 'show-all-option')
    .text('показать все')
    .on('click', () => {
      regionsIds.forEach(regionId => {
        regions[regionId].enabled = true;
      });

      singleLineSelected = false;

      redrawChart();
    });

  const linesContainer = svg.append('g')
    .attr('clip-path', 'url(#clip)');

  let singleLineSelected = false;

  const voronoi = d3.voronoi()
    .x(d => x(d.date))
    .y(d => y(d.percent))
    .extent([[0, 0], [width, height]]);

  const hoverDot = svg.append('circle')
    .attr('class', 'dot')
    .attr('r', 3)
    .attr('clip-path', 'url(#clip)')
    .style('visibility', 'hidden');

  let voronoiGroup = svg.append('g')
    .attr('class', 'voronoi-parent')
    .attr('clip-path', 'url(#clip)')
    .append('g')
    .attr('class', 'voronoi')
    .on('mouseover', () => {
      legendsDate.style('visibility', 'visible');
      hoverDot.style('visibility', 'visible');
    })
    .on('mouseout', () => {
      legendsValues.text('');
      legendsDate.style('visibility', 'hidden');
      hoverDot.style('visibility', 'hidden');
    });

  const zoomNode = d3.select('.voronoi-parent').call(zoom);

  d3.select('.reset-zoom-button').on('click', () => {
    rescaledX = x;
    rescaledY = y;

    d3.select('.voronoi-parent').transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  });

  d3.select('#show-voronoi')
    .property('disabled', false)
    .on('change', function () {
      voronoiGroup.classed('voronoi-show', this.checked);
    });

  const previewContainer = svg.append('g')
    .attr('transform', `translate(0,${ height + margin.top + 35 })`)
    .attr('class', 'preview');

  previewContainer.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', previewWidth)
    .attr('height', previewHeight)
    .attr('fill', '#dedede');

  const previewLineGenerator = d3.line()
    .x(d => previewX(d.date))
    .y(d => previewY(d.percent))
    .curve(d3.curveCardinal);

  const draggedNode = previewContainer
    .append('rect')
    .data([{ x: 0, y: 0 }])
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', previewWidth)
    .attr('height', previewHeight)
    .attr('fill', 'rgba(250, 235, 215, 0.78)')
    .call(d3.drag().on('drag', dragged));

  function dragged(d) {
    d3.select(this)
      .attr('x', d.x = d3.event.x)
      .attr('y', d.y = d3.event.y);

    zoomNode.call(zoom.transform, d3.zoomIdentity
      .scale(currentTransformationValue)
      .translate(-d3.event.x * ratio, -d3.event.y * ratio)
    );
  }

  redrawChart();

  function redrawChart(showingRegionsIds) {
    const enabledRegionsIds = showingRegionsIds || regionsIds.filter(regionId => regions[regionId].enabled);

    const paths = linesContainer
      .selectAll('.line')
      .data(enabledRegionsIds);

    paths.exit().remove();

    if (enabledRegionsIds.length === 1) {
      const previewPath = previewContainer
        .selectAll('path')
        .data(enabledRegionsIds);

      previewPath.exit().remove();

      previewPath
        .enter()
        .append('path')
        .merge(previewPath)
        .attr('class', 'line')
        .attr('d', regionId => previewLineGenerator(regions[regionId].data)
        )
        .style('stroke', regionId => colorScale(regionId));
    }

    paths
      .enter()
      .append('path')
      .merge(paths)
      .attr('class', 'line')
      .attr('id', regionId => `region-${ regionId }`)
      .attr('d', regionId => lineGenerator(regions[regionId].data)
      )
      .style('stroke', regionId => colorScale(regionId));

    legends.each(function(regionId) {
      const opacityValue = enabledRegionsIds.indexOf(regionId) >= 0 ? ENABLED_OPACITY : DISABLED_OPACITY;

      d3.select(this).attr('opacity', opacityValue);
    });

    const filteredData = data.filter(dataItem => enabledRegionsIds.indexOf(dataItem.regionId) >= 0);

    const voronoiPaths = voronoiGroup.selectAll('path')
      .data(voronoi.polygons(filteredData));

    voronoiPaths.exit().remove();

    voronoiPaths
      .enter()
      .append('path')
      .merge(voronoiPaths)
      .attr('d', d => (d ? `M${ d.join('L') }Z` : null))
      .on('mouseover', voronoiMouseover)
      .on('mouseout', voronoiMouseout)
      .on('click', voronoiClick);
  }

  function clickLegendRectHandler(regionId) {
    if (singleLineSelected) {
      const newEnabledRegions = singleLineSelected === regionId ? [] : [singleLineSelected, regionId];

      regionsIds.forEach(currentRegionId => {
        regions[currentRegionId].enabled = newEnabledRegions.indexOf(currentRegionId) >= 0;
      });
    } else {
      regions[regionId].enabled = !regions[regionId].enabled;
    }

    singleLineSelected = false;

    redrawChart();
  }

  function voronoiMouseover(d) {
    const transform = d3.zoomTransform(d3.select('.voronoi-parent').node());

    legendsDate.text(timeFormatter(d.data.date));

    legendsValues.text(dataItem => {
      const value = percentsByDate[d.data.date][dataItem];

      return value ? value + '%' : 'Н/Д';
    });

    d3.select(`#region-${ d.data.regionId }`).classed('region-hover', true);

    const previewPath = previewContainer
      .selectAll('path')
      .data([d.data.regionId]);

    previewPath.exit().remove();

    previewPath
      .enter()
      .append('path')
      .merge(previewPath)
      .attr('class', 'line')
      .attr('d', regionId => previewLineGenerator(regions[regionId].data)
      )
      .style('stroke', regionId => colorScale(regionId));

    hoverDot
      .attr('cx', () => transform.applyX(x(d.data.date)))
      .attr('cy', () => transform.applyY(y(d.data.percent)));
  }

  function voronoiMouseout(d) {
    d3.select(`#region-${ d.data.regionId }`).classed('region-hover', false);
  }

  function voronoiClick(d) {
    if (singleLineSelected) {
      singleLineSelected = false;

      redrawChart();
    } else {
      const regionId = d.data.regionId;

      singleLineSelected = regionId;

      redrawChart([regionId]);
    }
  }

  let currentTransformationValue = 1;

  function zoomed() {
    const transformation = d3.event.transform;

    rescaledX = transformation.rescaleX(x);
    rescaledY = transformation.rescaleY(y);

    xAxisElement.call(xAxis.scale(rescaledX));
    yAxisElement.call(yAxis.scale(rescaledY));

    linesContainer.selectAll('path')
      .attr('d', regionId => {
        return d3.line()
          .defined(d => d.percent !== 0)
          .x(d => rescaledX(d.date))
          .y(d => rescaledY(d.percent))(regions[regionId].data)
          .curve(d3.curveCardinal);
      });

    voronoiGroup
      .attr('transform', transformation);

    const xPreviewPosition = previewX.range().map(transformation.invertX, transformation)[0];
    const yPreviewPosition = previewY.range().map(transformation.invertY, transformation)[1];

    currentTransformationValue = transformation.k;

    draggedNode
      .data([{ x: xPreviewPosition / ratio, y: yPreviewPosition / ratio }])
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', previewWidth / transformation.k)
      .attr('height', previewHeight / transformation.k);
  }
}
