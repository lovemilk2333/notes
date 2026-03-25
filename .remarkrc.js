import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';

export default {
  plugins: [
    [remarkFrontmatter, ['yaml']],
    remarkGfm,
    {
      settings: {
        bullet: '-',
        emphasis: '*',
        strong: '*',
        fence: '`',
        listItemIndent: 2,
        resourceLink: true,
        rule: '-',
      }
    }
  ]
};