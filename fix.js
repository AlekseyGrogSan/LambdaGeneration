const fs = require('fs');
let code = fs.readFileSync('frontend/src/BestArticlesList.js', 'utf8');

code = code.replace(""import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';\n"", '');
code = code.replace(""  IconButton,\n"", '');

code = code.replace(
  ""const BestArticlesList = ({ isMobile, onArticleClick }) => {\n  const [open, setOpen] = useState(false);"",
  ""const BestArticlesList = ({ isMobile, onArticleClick, open, onClose }) => {""
);

code = code.replace(""  const toggleOpen = () => setOpen(!open);\n\n"", """");

const fb = "  const FireButton = (\n    <IconButton\n      onClick={toggleOpen}\n      sx={{\n        color: open ? '#ff9800' : '#ff5722',\n        transition: 'all 0.3s ease',\n        '&:hover': {\n          color: '#ff9800',\n          transform: 'scale(1.1)'\n        }\n      }}\n    >\n      <LocalFireDepartmentIcon fontSize=\""large\"" />\n    </IconButton>\n  );\n\n";
code = code.replace(fb, """");

code = code.replace(""if (isMobile) setOpen(false);"", ""if (isMobile && onClose) onClose();"");
code = code.replace(""<Modal open={open} onClose={toggleOpen} aria-labelledby=\""best-articles-mobile\"">"", ""<Modal open={open} onClose={onClose} aria-labelledby=\""best-articles-mobile\"">"");
code = code.replace(""      {FireButton}\n"", """");

code = code.replace(""<Box sx={{ position: 'fixed', left: 20, top: 80, zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>\n      <Collapse in={open} timeout=\""auto\"" unmountOnExit>"", ""<Box sx={{ position: 'fixed', left: 20, top: 80, zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pointerEvents: 'none' }}>\n      <Collapse in={open} timeout=\""auto\"" unmountOnExit sx={{ pointerEvents: 'auto' }}>"");

fs.writeFileSync('frontend/src/BestArticlesList.js', code);
console.log('Fixed BestArticlesList.js');