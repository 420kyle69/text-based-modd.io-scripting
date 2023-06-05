const re = /^[a-zA-Z_$][\w$]*$/;

export default function isValidIdentifier(identifier) {
  return re.test(identifier);
}