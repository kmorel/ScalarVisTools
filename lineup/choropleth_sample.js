//BI_MAP_SIZE=1;
//CALLBACK_SAMPLE = false;

function DiscreteSampler(w, h, svg, model, colormap)
{
	this.svg = svg;
	this.colormap = colormap;
	
	this.w = w;
    this.h = h;
    this.field = null;
    this.model = model;

    // add myself to the model
    if (model) {
        this.setModel(model);
    }

    ALL_SAMPLERS.push(this);
}

DiscreteSampler.prototype = Object.create(ScalarSample.prototype);


DiscreteSampler.prototype.vis = function()
{
	if (!this.model) {
		console.error("DiscreteSampler: No model!")
	}
	else if (!this.model.discreteMap)
	{
		console.error("DiscreteSampler: model has no discrete map!")

	}
	var discreteMap = this.model.discreteMap
	this.selectionCache = discreteMap.visTheMap(this.svg, this.colormap, this.selectionCache);
}

DiscreteSampler.prototype.setColorMap = function(colormap)
{
	this.colormap = colormap;
}
