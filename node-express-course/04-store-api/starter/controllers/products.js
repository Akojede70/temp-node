const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    // const products = await Product.find({
    //     name: 'vase table', bring data with name in this format
    // })
    // const products = await Product.find({}).sort('name -price') // - sign means the product will be sorted in descending order, price will be sorted in ascending order
    const products = await Product.find({ price: { $gt: 30 } }) // start with price more than 30
    .sort('price') // sort the price in ascending order, sort return everything in the array just that you will have to sort your details in ascending or or descending order with this sign (-)
    .select('name price')
    res.status(200).json({ products, nbHits: products.length })
}

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query
    const queryObject = {}

    if(featured) {
        queryObject.featured = featured === 'true' ? true : false
    }

    if (company) {
        queryObject.company = company
    }
    if (name) {
        queryObject.name = { $regex: name, $options: 'i' } 
        // $regex This allows for partial matching of the name field. Instead of an exact match
        // $options: for case sensitive when searching
    }

    if (numericFilters) {
        const operatorMap = {
            '>':'$gt',
            '>=':'$gte',
            '=':'$eq',
            '<':'$lt',
            '<=':'$lte',
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(
            // The replace method uses the regEx to find operators like >, >=, and replaces them using the operatorMap.
            // The match variable holds the matched operator (e.g., >), and the corresponding MongoDB operator is retrieved from operatorMap[match].
            // The operators are wrapped in -, making the filters string easier to split later on.
            regEx,(match) => `-${operatorMap[match]}-`
        )
        console.log(filters)
        const options = ['price', 'rating']
        //  This is an array that defines which fields can be filtered using numeric values. In this case, only price and rating are valid fields.
        filters = filters.split(',').forEach((item) => {
            // The filters string is split into individual filters using a comma , as the delimiter. For example, "price-$gt-30,rating-$gte-4" becomes an array like ["price-$gt-30", "rating-$gte-4"].
            const [field, operator, value ] = item.split('-')
            if (options.includes(field)){
                queryObject[field] = { [operator]: Number(value) }
            }
            // Each filter string is split again, this time by the - character (which was added earlier) to extract the field (price, rating), the MongoDB operator ($gt, $gte), and the value (30, 4).
//             For example, price-$gt-30 becomes:
// field = 'price'
// operator = '$gt'
// value = '30'
        });
    }

    console.log(queryObject)

    let result = Product.find(queryObject)
    if (sort) {
      const sortList = sort.split(',').join(' ');
      result = result.sort(sortList)
    } else {
        result = result.sort('createAt')
    }
    
    if(fields){
        // This will only return the name and price fields of 
        // each product, excluding all other fields like description, company
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    // This calculates how many products to skip to get to the current page.
// For example, if page = 2 and limit = 10, it skips the first 10 products ((2 - 1) * 10 = 10) to display the next set of products.
    result = result.skip(skip).limit(limit)
    // 23
    // 4 pages
    // 7 7 7 2 // 7 items in each page and and 2 the last making 23
    const products = await result
    res.status(200).json({ products, nbHits: products.length})
} 

module.exports = {
    getAllProducts,
    getAllProductsStatic,
}