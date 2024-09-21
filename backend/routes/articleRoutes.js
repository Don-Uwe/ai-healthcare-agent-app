const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authenticateToken = require('../middleware/authentcatetoken');

/**** For Article Tags */
router.post('/articles/tags', articleController.addNewTag);
router.get('/articles/tags', authenticateToken, articleController.getAllTags);
router.put('/articles/tags/:id', articleController.updateTagById);
router.delete('/articles/tags/:id', articleController.deleteArticleTagByIds);



/**** For Article *****/
router.post('/articles',authenticateToken, articleController.createArticle); // Create a new article
router.get('/articles',authenticateToken, articleController.getAllArticles);// Get all articles
router.get('/articles/:id',authenticateToken, articleController.getArticleById);// Get an article by ID
router.put('/articles/:id',authenticateToken, articleController.updateArticle);// Update an article by ID
router.delete('/articles/:id',authenticateToken, articleController.deleteArticle);// Delete an article by ID
router.get('/articles/:title',authenticateToken, articleController.getArticleByTitle);// get article by title
router.get('/articles/:AuthorName',authenticateToken, articleController.getArticleByAuthorName);//  get an article by name(Author)
router.get('/articles/:name',authenticateToken, articleController.getArticleByName);//  get an article by name
router.get('/articles/:tag',authenticateToken, articleController.getArticlesByTags);// / get an article by tag
router.get('/articles/:summary',authenticateToken, articleController.getArticlesBySummary);// / get an article by Summary
router.post('/articles/saveArticle', authenticateToken, articleController.saveArticle); // Save Article
router.post('/articles/likeArticle', authenticateToken, articleController.likeArticle ); // For Like and Dislike
router.post('/articles/updateViewCount', authenticateToken, articleController.updateViewCount ); // For Like and Dislike

module.exports = router;
