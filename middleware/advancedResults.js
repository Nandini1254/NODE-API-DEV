const advancedResults = (model, populate) => async function (req, res, next) {
    //create object
    const reqQuery = { ...req.query }

    //remove select operators
    const removeParams = ['select', 'sort', 'page', 'limit'];

    removeParams.forEach(param => {
        delete reqQuery[param];
    })

    //create queryString
    let queryString = JSON.stringify(reqQuery);

    //add $ operator in query
    queryString.replace(/\b(gt | gte | lt | lte | in)\b\g/, match => `$${match}`);

    //search query
    let query = model.find(JSON.parse(queryString));

    //fileds select
    if (req.query.select) {
        const selectFields = req.query.select.split(',').join(' ');
        query = query.select(selectFields);
    }

    if (populate) {
        query = query.populate(populate);
    }
    //sort
    if (req.query.sort) {
        const sortFields = req.query.sort.split(',').join(' ');
        query = query.sort(sortFields);
    } else {
        query = query.sort('-createdAt');
    }

    //pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query.skip(startIndex).limit(limit);
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    //execute
    const results = await query;

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    };


    next();
}

module.exports = advancedResults;