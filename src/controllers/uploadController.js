const xlsx = require('xlsx');
const { asyncHandler } = require('../middleware/errorHandler');
const fs = require('fs').promises;
const path = require('path');
const {Op} = require('sequelize')
const db = require('../config/database');

// const bulkUpload = asyncHandler(async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const { category_id } = req.body;

//     try {
//         let data = [];

//         if (req.file.mimetype.includes('spreadsheet') || req.file.originalname.endsWith('.xlsx')) {
//             const workbook = xlsx.read(req.file.buffer);
//             const worksheet = workbook.Sheets[workbook.SheetNames];
//             data = xlsx.utils.sheet_to_json(worksheet);
//         } else if (req.file.mimetype.includes('csv') || req.file.originalname.endsWith('.csv')) {
//             const csv = require('csv-parse/sync');
//             // console.log(req.file);
//             const fileContent = await fs.readFile(req.file.path, 'utf8');
//             data = csv.parse(fileContent, { columns: true });
            
//             // data = csv.parse(req.file.buffer.toString(), { columns: true });
//         } else {
//             return res.status(400).json({ error: 'Only CSV and XLSX files allowed' });
//         }

//         if (data.length === 0) {
//             return res.status(400).json({ error: 'File is empty' });
//         }

//         const batchSize = 100;
//         let successCount = 0;
//         let errorCount = 0;
//         const errors = [];

//         for (let i = 0; i < data.length; i += batchSize) {
//             const batch = data.slice(i, i + batchSize);

//             for (const row of batch) {
//                 try {
//                     const { name, price, product_image, category_name } = row;
//                     console.log(name, price);
                    
//                     if (!name || !price) {
//                         errorCount++;
//                         errors.push(`Row ${i + batch.indexOf(row) + 1}: Missing name or price`);
//                         continue;
//                     }

//                     let catId = category_id;
//                     if (category_name && !catId) {
//                         const catResult = await db.Category.findOne({ where: { name: category_name, createdById: req.userId } });
//                         // query(
//                         //     'SELECT id FROM categories WHERE name = $1 AND created_by = $2 LIMIT 1',
//                         //     [category_name, req.userId]
//                         // );
//                         if (catResult) {
//                             catId = catResult.id;
//                         }
//                     }

//                     if (!catId) {
//                         errorCount++;
//                         errors.push(`Row ${i + batch.indexOf(row) + 1}: No category found`);
//                         continue;
//                     }

//                     await db.Product.create({
//                         name,
//                         price: parseFloat(price),
//                         categoryId: catId,
//                         productImage: product_image || null,
//                         createdById: req.userId
//                     });
//                     successCount++;
//                 } catch (error) {
//                     errorCount++;
//                     errors.push(`Row ${i + batch.indexOf(row) + 1}: ${error.message}`);
//                 }
//             }
//         }

//         res.json({
//             message: 'Bulk upload completed',
//             successCount,
//             errorCount,
//             totalRows: data.length,
//             errors: errors.slice(0, 10)
//         });
//     } catch (error) {
//         res.status(400).json({ error: 'File parsing failed: ' + error.message });
//     }
// });


const bulkUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { category_id } = req.body;
  const BATCH_SIZE = 500;
  
  try {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const categoryCache = new Map();
    
    const processStream = async (stream) => {
      let batch = [];
      let rowNumber = 0;

      for await (const row of stream) {
        rowNumber++;
        
        try {
          const { name, price, product_image, category_name } = row;

          if (!name || !price) {
            errorCount++;
            errors.push(`Row ${rowNumber}: Missing name or price`);
            continue;
          }

          let catId = category_id;
          
          if (category_name && !catId) {
            // Check cache first
            if (categoryCache.has(category_name)) {
              catId = categoryCache.get(category_name);
            } else {
              // Query database and cache result
              const catResult = await db.Category.findOne({
                where: { name: category_name, createdById: req.userId },
                attributes: ['id']
              });
              
              if (catResult) {
                catId = catResult.id;
                categoryCache.set(category_name, catId);
              }
            }
          }

          if (!catId) {
            errorCount++;
            errors.push(`Row ${rowNumber}: No category found`);
            continue;
          }


          batch.push({
            name,
            price: parseFloat(price),
            categoryId: catId,
            productImage: product_image || null,
            createdById: req.userId
          });

          if (batch.length >= BATCH_SIZE) {
            await processBatch(batch);
            successCount += batch.length;
            batch = [];
          }
        } catch (error) {
          errorCount++;
          errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      }

      if (batch.length > 0) {
        await processBatch(batch);
        successCount += batch.length;
      }

      return { successCount, errorCount, totalRows: rowNumber };
    };
    const processBatch = async (batch) => {
      if (batch.length === 0) return;
      
      await db.Product.bulkCreate(batch, {
        validate: true,
        ignoreDuplicates: false
      });
    };

    let result;

    if (req.file.mimetype.includes('spreadsheet') || req.file.originalname.endsWith('.xlsx')) {
      const workbook = xlsx.read(req.file.buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      async function* xlsxGenerator(arr) {
        for (const item of arr) {
          yield item;
        }
      }
      
      result = await processStream(xlsxGenerator(data));
    } 
    else if (req.file.mimetype.includes('csv') || req.file.originalname.endsWith('.csv')) {
      const { parse } = require('csv-parse');
      const { Readable } = require('stream');
      let readStream;
      if (req.file.buffer) {
        readStream = Readable.from(req.file.buffer);
      } else {
        readStream = require('fs').createReadStream(req.file.path);
      }
      
      const parser = readStream.pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }));
      console.log(parser);
      
      result = await processStream(parser);
    } 
    else {
      return res.status(400).json({ error: 'Only CSV and XLSX files allowed' });
    }

    if (result.totalRows === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    res.json({
      message: 'Bulk upload completed',
      successCount: result.successCount,
      errorCount: result.errorCount,
      totalRows: result.totalRows,
      errors: errors.slice(0, 10) // Only return first 10 errors
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(400).json({ error: 'File parsing failed: ' + error.message });
  }
});
const exportProducts = asyncHandler(async (req, res) => {
    const { format = 'csv', search = '' } = req.query;

    const searchQuery = search ? '%' + search.toLowerCase() + '%' : '%%';

    const result = await db.Product.findAll({
        where: {
            [Op.or]: [
                { name: { [Op.like]: searchQuery } },
                { '$category.name$': { [Op.like]: searchQuery } }
            ]
        },
        include: [{
            model: db.Category,
            as: 'category',
            required: true
        }],
        order: [['createdAt', 'DESC']]
    });
    if (result.length === 0) {
        return res.status(404).json({ error: 'No products found' });
    }

    if (format === 'xlsx') {
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(result);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

        const filename = `products_${Date.now()}.xlsx`;
        const filepath = path.join(__dirname, '../../uploads', filename);

        xlsx.writeFile(workbook, filepath);

        res.download(filepath, filename, async () => {
            await fs.unlink(filepath);
        });
    } else {
        const csvRows = result.map(product => ({
            id: product.id,
            uniqueId: product.uniqueId,
            category_name: product.category?.name || '',
            name: product.name,
            price: product.price
        }));
        const csv = require('csv-stringify/sync');
        const csvData = csv.stringify(csvRows, {
            header: true,
            columns: ['id', 'uniqueId', 'category_name', 'name', 'price'],
        });
        const uploadDir = path.join(__dirname, '../../uploads/exports');

        await fs.mkdir(uploadDir, { recursive: true });

        const fileName = `products_${Date.now()}.csv`;
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, csvData);
        res.json({
            message: 'Export created successfully',
            downloadUrl: `/uploads/exports/${fileName}`
        });
    }
});

module.exports = { bulkUpload, exportProducts };
