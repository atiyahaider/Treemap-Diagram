const Width = 1000;
const Height = 580;
const LegendRectSize = 15;
const LegendSpacing = 6;
let LegendWidth = 200;

const DataSets = {
  kickstarter: {
    Title: 'Kickstarter Pledges',
    Desc: 'Top 100 Kickstarter Pledges Grouped by Category',
    URL: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json' },

  movieSales: {
    Title: 'Movie Sales',
    Desc: 'Top 100 Movie Sales Grouped by Genre',
    URL: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json' },

  videoGames: {
    Title: 'Video Game Sales',
    Desc: 'Top 100 Video Games Sales Grouped by Platform',
    URL: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json' } };



let svg;
let svgLegend;

//Create an array of 20 colors
var colors = [];
for (let i = 0; i < 10; i++) {
  colors.push(d3.schemeCategory10[i]);
  colors.push(d3.schemeSet3[i]);
}

//Set the initial dataset for first load
var DataSet = DataSets.kickstarter;

$(document).ready(function () {
  renderPage();
});

$('#kickStarter').click(function () {
  LegendWidth = 200;
  reloadPage(DataSets.kickstarter);
});
$('#movieSales').click(function () {
  LegendWidth = 100;
  reloadPage(DataSets.movieSales);
});
$('#videoGames').click(function () {
  LegendWidth = 70;
  reloadPage(DataSets.videoGames);
});

function reloadPage(dataSet) {
  DataSet = dataSet;
  svg.remove();
  svgLegend.remove();
  renderPage();
}

function renderPage() {
  //Assign title and description
  d3.select('#title').html(DataSet.Title);
  d3.select('#description').html(DataSet.Desc);

  //Create SVG canvas for treemap
  svg = d3.select('#treeMap').
  append('svg').
  attr('width', Width).
  attr('height', '100%').
  attr('viewBox', '0 0 ' + Width + ' ' + Height).
  attr('preserveAspectRatio', 'xMinYMin meet');

  //Read the JSON file
  d3.json(DataSet.URL).then(function (Data) {

    //tool tip
    var tip = d3.tip().
    attr('id', 'tooltip').
    offset(function () {return [this.getBBox().height / 2, 0];}).
    html(d => {d3.select('#tooltip').
      attr('data-value', d.data.value);
      return '<span>' + 'Name: ' + d.data.name + '<br>Category: ' + d.data.category + '<br>Value: ' + d.data.value + '</span>';
    });
    svg.call(tip);

    //Create treemap layout
    var treemapLayout = d3.treemap().
    size([Width, Height]).
    paddingInner(1);

    //Run .sum() on the hierarchy. This traverses the tree and sets .value on each node to the sum of its children:
    var root = d3.hierarchy(Data).
    sum(d => d.value).
    sort((a, b) => b.height - a.height || b.value - a.value);

    //call treemapLayout, passing in the hierarchy object
    treemapLayout(root);

    //Set the color scheme and domain
    var categories = root.leaves().map(nodes => nodes.data.category);
    categories = categories.filter(function (category, index, self) {
      return self.indexOf(category) === index;
    });
    var colorScale = d3.scaleOrdinal().
    domain(categories).
    range(colors);

    //The layout adds 4 properties x0, x1, y0 and y1 to each node which specify the dimensions of each rectangle in the treemap.
    //Join the nodes to rect elements and update the x, y, width and height properties of each rect
    var nodes = svg.selectAll('g').
    data(root.leaves()).
    enter().
    append('g').
    attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')');

    nodes.append('rect').
    attr('class', 'tile').
    attr('width', d => d.x1 - d.x0).
    attr('height', d => d.y1 - d.y0).
    attr('fill', d => colorScale(d.data.category)).
    attr('data-name', d => d.data.name).
    attr('data-category', d => d.data.category).
    attr('data-value', d => d.data.value).
    on('mouseover', tip.show).
    on('mouseout', tip.hide);

    nodes.append('text').
    selectAll('tspan').
    data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g)).
    enter().
    append('tspan').
    attr('x', 1).
    attr('y', (d, i) => 12 + i * 10).
    text(d => d);

    //legend
    //Create SVG canvas for the legend
    svgLegend = d3.select('#treeMap').
    append('svg').
    attr('width', LegendWidth).
    attr('height', '100%').
    attr('viewBox', '0 0 ' + LegendWidth + ' ' + Height).
    attr('preserveAspectRatio', 'xMinYMin meet');


    var legendBox = svgLegend.append('g').
    attr('transform', 'translate(' + [10, 0] + ')');

    // legend box
    var legend = legendBox.selectAll('.legend').
    data(colorScale.domain()).
    enter().
    append('g').
    attr('class', 'legend').
    attr('id', 'legend').
    attr("transform", (d, i) => "translate(0," + i * (LegendRectSize + LegendSpacing) + ")");

    //legend rectangles
    legend.append('rect').
    attr('width', LegendRectSize).
    attr('height', LegendRectSize).
    attr('class', 'legend-item').
    style('fill', d => colorScale(d));

    //legend text
    legend.append('text').
    attr('x', LegendRectSize + LegendSpacing).
    attr('y', LegendRectSize - LegendSpacing).
    attr('fill', 'white').
    attr('dy', '0.25em').
    style('font-size', 12).
    text(d => d);
  });
}