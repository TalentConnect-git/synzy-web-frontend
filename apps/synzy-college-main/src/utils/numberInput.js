// utils/numberInput.js

export const getSafeNumber = (value, options = {}) => {
  const {
    min = 0,
    max = Infinity,
    allowEmpty = true,
  } = options;

  if (value === "") return allowEmpty ? "" : min;

  let num = Number(value);

  if (isNaN(num)) return min;

  if (num < min) num = min;
  if (num > max) num = max;

  return num;
};

export const blockInvalidNumberKeys = (e) => {
  if (e.key === "-" || e.key === "e") {
    e.preventDefault();
  }
};