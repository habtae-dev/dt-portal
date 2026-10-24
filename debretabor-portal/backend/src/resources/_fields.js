// Small builders so every resource declares its bilingual (_en / _am) columns the same way.
// English is the required base language when the schema says NOT NULL; Amharic is always optional.
const str = (max, opts = {}) => ({ type: 'string', max, ...opts });
const text = (opts = {}) => ({ type: 'text', ...opts });

// title_en / title_am style pair
const pair = (base, kind = 'string', { max = 255, requiredEn = false } = {}) => ({
  [`${base}_en`]: kind === 'text' ? text({ required: requiredEn }) : str(max, { required: requiredEn }),
  [`${base}_am`]: kind === 'text' ? text() : str(max)
});

const bool = (extra = {}) => ({ type: 'bool', ...extra });
const oneOf = (values, extra = {}) => ({ type: 'enum', values, ...extra });

module.exports = { str, text, pair, bool, oneOf };
