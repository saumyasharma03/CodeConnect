const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  language: { type: String, default: 'javascript' },
  code: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SnippetSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Snippet', SnippetSchema);
