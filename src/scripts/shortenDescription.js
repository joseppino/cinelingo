const MAX_LENGTH = 256; // define max string length

export default function (description) {
  if(description && description.length > MAX_LENGTH) { 
    for(let i=MAX_LENGTH - 1; i>0; i--) { // loop back through previous characters
      let currentChar = description.charAt(i);
      if(currentChar === ' ' || currentChar === '.') { // search for a space or end of sentence
        return description.substring(0, i) + "...";
      }
    }
  } else {
    return description; // otherwise return unchanged description
  }
}