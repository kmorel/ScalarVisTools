function Lineup(w, h, n, realModel, decoyModel, nullOption, table)
{
    // total number of exposures (n-1 actual + 1 decoy)
    this.w = w;
    this.h = h;
    this.n = n;

    this.realModel = realModel;
    this.decoyModel = decoyModel;

    // create canvases and samplers
    this.canvases = [];
    this.samplers = [];

    this.nullOption = nullOption;

    var canvasType = 'canvas'
    if (typeof CANVAS_TYPE === 'string') {
        canvasType = CANVAS_TYPE
    }
    var samplerType = ScalarSample;
    if (typeof SAMPLER_TYPE !== 'undefined') {
        samplerType = SAMPLER_TYPE;
    }

    // initialize random canvases
    for (var i=0; i<n; i++) 
    {
        this.canvases.push(null);
    }
    if (table) {
        this.layoutCanvases(table)
    }

    for (var i=0; i<n; i++)
    {
        var canvas = this.canvases[i];
        if (!canvas) {
        
            canvas = document.createElement(canvasType);

            if (canvasType == 'svg')
            {
                d3.select(canvas)
                    .attr('width', w)
                    .attr('height', h);
            }
            else
            {
                canvas.width = w;
                canvas.height = h;
            }
        
            canvas.id="sample" + i;
            this.canvases[i] = ( canvas );
        }

        // sampler
        var sampler = new samplerType(w, h, canvas, i==n-1 ? this.decoyModel : this.realModel);
        this.samplers.push(sampler);
    }
    this.correctSample = n-1;
}

Lineup.prototype.dispose = function() {
    for (var i=0; i<this.samplers.length; i++) {
        this.samplers[i].dispose();
    }
    this.samplers = null;
    this.canvases = null;
}

Lineup.prototype.getCorrectAnswer = function() {
    return this.correctSample;
}

Lineup.prototype.sample = function(samplingRate, noDecoy) 
{
    if (noDecoy) {
        console.log('sampling no decoy (fidelity: ' + samplingRate + ')');
    }
    for (var i=0; i<this.samplers.length; i++)
    {
        this.samplers[i].sampleModel(samplingRate, noDecoy ? this.realModel : undefined);
        this.samplers[i].vis();
    }
}

var LINEUP_PADDING = 6;
var LINEUP_SPACING = 10;

Lineup.prototype.layoutCanvases = function(table)
{
    if (!table) {
        table = this.table;
    }
    var randomCanvases = this.canvases.slice();
    var decoyCanvas = randomCanvases.pop();

    // reinsert
    var insertPos = Math.floor( Math.random() * (randomCanvases.length+1) );
    randomCanvases.splice(insertPos, 0, decoyCanvas);

    var canvasType = 'canvas';
    if (typeof CANVAS_TYPE === 'string') {
        canvasType = CANVAS_TYPE;
    }


    // remove everything in the table
    table.selectAll('*').remove();
    table.attr('cellpadding', LINEUP_PADDING).attr("cellspacing", LINEUP_SPACING);

    // how many rows
    var rows = 2;
    var cols = Math.ceil(this.n/2);

    (function(width, height, table, rows, cols, n, randomCanvases, nullOption)
    {
        var rs = d3.range(rows);
        table.selectAll('tr').data(rs)
            .enter().append('tr')
            .each(function(d, thisRow) 
            {
                (function(rowNum, thisRow) 
                {
                    d3.select(thisRow).selectAll('td').data(d3.range(cols))
                        .enter().append('td').each(function(d, i) {
                            var index = i + rowNum*cols;
                            if (index < n) 
                            {
                                var canvas = randomCanvases[index];
                                if (!canvas) {
                                    var c = d3.select(this).append(canvasType);
                                    c
                                        .attr('width', width)
                                        .attr('height', height)
                                        .attr('id', "sample" + index);

                                    randomCanvases[canvas] = c;
                                }

                                this.appendChild( randomCanvases[index] );
                                d3.select(randomCanvases[index])
                                    .attr('class', 'index' + index);
                            }
                        });

                    if (rowNum==0 && nullOption) 
                    {
                        var w_div = +d3.select(randomCanvases[0]).attr('width')
                        var w = 25 + w_div;
                        var h = +d3.select(randomCanvases[0]).attr('height');
                        var tdNull = d3.select(thisRow).append('td')
                            .attr('rowSpan', rows)
                            .attr('width', w);

                        var div = tdNull.append('div')
                            .style('margin', '0 auto')
                            .style('width', w + 'px');
                        div.append('div')
                            .style('margin-top', ((rows*h)/2-h/1) + 'px')
                            .style('margin-left', 'auto')
                            .style('margin-right', 'auto')
                            .attr('class', 'nullOption')
                            .style('text-align', 'center')
                            .style('vertical-align', 'middle')
                            .style('width', w_div + 'px')
                            .style('height', h + 'px')
                            .style('border', 'solid 1px black')
                            .style('font-size', '35px')
                            .style('color', "#bbbbbb")
                            .style('font-weight', 'bold')
                            .html('no discernible difference between images');
                    }
                })(d, this);
            });
    })(this.w, this.h, table, rows, cols, this.n, randomCanvases, this.nullOption);
    this.table = table;
}

function LineupFixed(w, h, n, realModel, decoyModel, nullOption, table)
{
    this.w = w;
    this.h = h;
    this.n = n;

    this.realModel = realModel;
    this.decoyModel = decoyModel;

    // create canvases and samplers
    this.canvases = [];
    this.samplers = [];

    this.nullOption = nullOption;

    this.canvasType = 'canvas';
    if (typeof CANVAS_TYPE === 'string') {
        this.canvasType = CANVAS_TYPE;
    }
    var samplerType = ScalarSample;
    if (typeof SAMPLER_TYPE !== 'undefined') 
    {
        samplerType = SAMPLER_TYPE;
    }

    (function(_table, canvases, canvasType) 
    {
        var selectionSize = table.selectAll(canvasType).size();
        if (selectionSize != n) {
            console.error("LineupFixed: number of canvases (" + selectionSize + ") + doesn't match number of requested lineup samples (" + n + ")");
        }

        table.selectAll(canvasType).each(function() {
            canvases.push(d3.select(this));
            d3.select(this)
                .attr('id', 'sample' + (canvases.length-1))
                .classed('index' + (canvases.length-1), true);
        });

        table
            .attr('cellpadding', LINEUP_PADDING).attr("cellspacing", LINEUP_SPACING);
    })(table, this.canvases, this.canvasType);
    this.table = table;

    // create samplers
    for (var i=0; i<n; i++) {
        var canvas = this.canvases[i];
        var sampler = new samplerType(w, h, canvas, i==n-1 ? this.decoyModel : this.realModel);
        this.samplers.push(sampler);
    }

    // randomly assign the real model
    this.randomAssignCorrect()

}

LineupFixed.prototype = Object.create(Lineup.prototype);

LineupFixed.prototype.randomAssignCorrect = function() 
{
    // generate random number
    var correctIndex = Math.floor(Math.random() * this.canvases.length);
    
    for (var i=0; i<this.n; i++) 
    {
        var dontVis = true;
        if (i == correctIndex) {
            this.samplers[i].setModel(this.decoyModel, dontVis);
        }
        else
        {
            this.samplers[i].setModel(this.realModel, dontVis);
        }
    }
    this.correctSample = correctIndex;
}

LineupFixed.prototype.layoutCanvases = function() 
{
    this.randomAssignCorrect();
}

