/** Text set letter by letter for the staggered entrance. Assistive tech reads the plain copy. */
export function Letters(props: { text: string }) {
  const count = props.text.replace(/ /g, "").length;
  let index = 0;
  return (
    <>
      <span class="sr-only">{props.text}</span>
      <span class="letters" aria-hidden="true" style={{ "--n": String(count) }}>
        {props.text.split(" ").map((word) => (
          <>
            <span class="letter-word">
              {[...word].map((letter) => (
                <span class="letter" style={{ "--i": String(index++) }}>
                  {letter}
                </span>
              ))}
            </span>{" "}
          </>
        ))}
      </span>
    </>
  );
}
