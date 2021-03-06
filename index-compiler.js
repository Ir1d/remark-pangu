// const pangu = require('pangu')
import CopyWritingCorrectService from 'copywriting-correct';

var copywriting_correct_1 = require("copywriting-correct");
var service = new copywriting_correct_1.CopyWritingCorrectService();

// List of Markdown AST: <https://github.com/syntax-tree/mdast>
// AST Explorer: <https://astexplorer.net/#/gist/7a794a8fc43b2e75e27024c85fb77aad/0934495eb735dffdf739dc7943f7848940070f8e>
//
// AST we should format:
// 1. text node:
//    * paragraph children
//    * blockquote children
//    * heading children
//    * emphasis children
//    * strong children
//    * listItems children
//    * tableCell children
//    * delete children
//    * link children
//    * image children
//    * footnote children
// 2. inlineCode value
// 3. link title
// 4. image title/alt
// 5. imageReference alt
// 6. definition title
//
//
// AST we ignored:
// 1. YAML
// 2. html (it can contain link: <a> <img>)
// 3. 临接情况
//     1. 粗体：我的a**粗体**
//     2. 强调：我的a*强调*
//     3. ...

function format(value) {
  if (!value) return value
  return service.correct(value);
  // return pangu.spacing(value)
}

function createFormatNodeVisitorCreator(nodeKey) {
  return function visitorCreator(originVisitor) {
    return function valueVisitor(node, ...args) {
      const formattedNode = Object.assign({}, node, {
        [nodeKey]: format(node[nodeKey]),
      })

      return originVisitor.call(this, formattedNode, ...args)
    }
  }
}

function assignVisitors(visitors, types, createVisitor) {
  types.forEach(type => {
    visitors[type] = createVisitor(visitors[type])
  })
}

function assignValueVisitors(visitors) {
  const valueVisitorCreator = createFormatNodeVisitorCreator('value')
  assignVisitors(visitors, ['text', 'inlineCode'], valueVisitorCreator)
}

function assignTitleVisitor(visitors) {
  const titleVisitorCreator = createFormatNodeVisitorCreator('title')
  assignVisitors(visitors, ['link', 'image', 'definition'], titleVisitorCreator)
}

function assignAltVisitor(visitors) {
  const altVisitorCreator = createFormatNodeVisitorCreator('alt')
  assignVisitors(visitors, ['image', 'imageReference'], altVisitorCreator)
}

function isRemarkCompiler(compiler) {
  return Boolean(compiler && compiler.prototype && compiler.prototype.visitors)
}

function attachCompiler(compiler) {
  const proto = compiler.prototype
  assignValueVisitors(proto.visitors)
  assignTitleVisitor(proto.visitors)
  assignAltVisitor(proto.visitors)
}

module.exports = function remarkPangu() {
  const Compiler = this.Compiler

  if (isRemarkCompiler(Compiler)) {
    attachCompiler(Compiler)
  }
  var visitors = Compiler.prototype.visitors;
  var original = visitors.inlineMath;
  visitors.inlineMath = inlineMath;
  function inlineMath(node) {
    return " " + original.apply(this, arguments) + " ";
  }
  }
}
