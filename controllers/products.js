const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({name: 'vase table'});
    res.status(200).json({products, nbHits: products.length});
}

const getAllProducts = async (req, res) => {
    // const featured = req.query.featured
    const {featured, company , name, sort, fields, numericFilter} = req.query 
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 30
    const skip = (page - 1)*limit; 
    const queryObject = {}

    if (featured) {
        queryObject.featured = featured === 'true' ? true : false
    }

    if (company) {
        queryObject.company = {$regex : company, $options: 'i'};
    }

    if (name) {
        queryObject.name = {$regex : name, $options: 'i'};
    }

    if (numericFilter) {
        const operatorMap = {
            '>' : '$gt',
            '>=' : '$gte',
            '=' : '$e',
            '<' : '$lt',
            '<=' : '$lte',
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilter.replace(regEx, (match) => {
            `-${operatorMap[match]}-`
        })
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach(item => {
            const [field, operator, value] = item.split('-')
            if (options.includes(field)) {
                queryObject[field] = {[operator] : Number(value)}
             
            }

        });
    }


    //can not use await since sort/select need values, not promises. So must place await at the end
    let result = Product.find(queryObject);
    if (sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList)
    }
    else result = result.sort('createdAt')

    if (fields) {
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList)
    }
    result = result.skip(skip).limit(limit);
    const product = await result
    res.status(200).json({product, nbHits: product.length});
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}   