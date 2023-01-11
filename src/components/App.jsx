import React, { useEffect } from "react"
import styles from "./ChatBox.module.css"
import { Button, Box, Input } from "retro-ui"

const DEFAULT_PARAMS = {
  model: "text-curie-001",
  temperature: 0.7,
  max_tokens: 256,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
}

export async function query(params = {}, openai_api_key) {
  const params_ = { ...DEFAULT_PARAMS, ...params }
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(openai_api_key),
    },
    body: JSON.stringify(params_),
  }
  const response = await fetch(
    "https://api.openai.com/v1/completions",
    requestOptions,
  )
  const data = await response.json()
  return data.choices[0].text
}

const petPrompt = `
#name (#hero's pet)
#description
Q: What does #name do when they get bored?
#question1
Q: How does #name defend themself?
#question2
Q: What is #name's best quality?
#question3
#conversation
#hero: #input
#name:
`

const allyPrompt = `
#name (#hero's ally)
#description
Q: Where does your allegiance lie?
#name: #question1
Q: What is your greatest strength?
#name: #question2
Q: What is your greatest weakness?
#name: #question3
#conversation
#hero: #input
#name:
`

const enemyPrompt = `
#name (enemy)
#description
Q: Where does your allegiance lie?
#name: #question1
Q: What is your greatest strength?
#name: #question2
Q: What is your greatest weakness?
#name: #question3
#conversation
#hero: #input
#name:
`

const prompts = {
  pet: petPrompt,
  ally: allyPrompt,
  enemy: enemyPrompt,
}

export default function App() {
  const [heroName, setHeroName] = React.useState("")
  // try getting api key from local storage
  const [apiKey, setKey] = React.useState(localStorage.getItem("apiKey") ?? "")
  const [type, setType] = React.useState(localStorage.getItem("type") ?? "pet")
  const [name, setName] = React.useState(localStorage.getItem("name") ?? "")
  const [description, setDescription] = React.useState(
    localStorage.getItem("description") ?? "",
  )
  const [question1, setQuestion1] = React.useState(
    localStorage.getItem("question1") ?? "",
  )
  const [question2, setQuestion2] = React.useState(
    localStorage.getItem("question2") ?? "",
  )
  const [question3, setQuestion3] = React.useState(
    localStorage.getItem("question3") ?? "",
  )

  const [input, setInput] = React.useState("")

  const [messages, setMessages] = React.useState([])
  const handleChange = async (event) => {
    event.preventDefault()
    setInput(event.target.value)
  }

  useEffect(() => {
    if (!apiKey || apiKey === "") return
    localStorage.setItem("apiKey", apiKey)
  }, [apiKey])

  useEffect(() => {
    if (!heroName || heroName === "") return
    localStorage.setItem("heroName", heroName)
  }, [heroName])

  useEffect(() => {
    if (!type || type === "") return
    localStorage.setItem("type", type)
  }, [type])

  useEffect(() => {
    if (!name || name === "") return
    localStorage.setItem("name", name)
  }, [name])

  useEffect(() => {
    if (!description || description === "") return
    localStorage.setItem("description", description)
  }, [description])

  useEffect(() => {
    if (!question1 || question1 === "") return
    localStorage.setItem("question1", question1)
  }, [question1])

  useEffect(() => {
    if (!question2 || question2 === "") return
    localStorage.setItem("question2", question2)
  }, [question2])

  useEffect(() => {
    if (!question3 || question3 === "") return
    localStorage.setItem("question3", question3)
  }, [question3])

  // if user presses ctrl c, clear the messages
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "c") {
        setMessages([])
        // spacebar
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleSubmit = async (event) => {
    if (event.preventDefault) event.preventDefault()
    // Get the value of the input element
    const input = event.target.elements.message
    const value = input.value

    let output = prompts[type]
      .replaceAll("#hero", heroName)
      .replaceAll("#name", name)
      .replaceAll("#description", description)
      .replaceAll("#question1", question1)
      .replaceAll("#question2", question2)
      .replaceAll("#question3", question3)
      .replaceAll("#conversation", messages.join("\n"))
      .replaceAll("#input", value)

    console.log("sending output")

    const completion = await query(
      {
        ...DEFAULT_PARAMS,
        prompt: output,
      },
      apiKey,
    )

    // get the first 5 messages
    const newMessages = [...messages]
    newMessages.push(heroName + ": " + value)
    setMessages([...newMessages, name + ": " + completion])
    setInput("")
  }

  return (
    <div className={styles["bg"]}>
      <div className={styles["wrapper"]}>
        <Input
          type="text"
          name="What is your name, hero?"
          defaultValue={heroName}
          onChange={(event) => setHeroName(event.target.value)}
        />

        <Input
          type="password"
          defaultValue={apiKey}
          name="What is your OpenAI key?"
          onChange={(event) => setKey(event.target.value)}
        />

        <Button
          style={{ margin: '1em', display: 'inline', opacity: type === "pet" ? 1.0 : 0.5 }}
          onClick={() => {
            setType("pet")
          }}
        >
          Pet
        </Button>
        <Button
          style={{ margin: '1em', display: 'inline', opacity: type === "ally" ? 1.0 : 0.5 }}
          onClick={() => {
            setType("ally")
          }}
        >
          Ally
        </Button>

        <Button
          style={{ margin: '1em', display: 'inline', opacity: type === "enemy" ? 1.0 : 0.5 }}
          onClick={() => {
            setType("enemy")
          }}
        >
          Enemy
        </Button>
        <br />
        <Input
          type="text"
          name="name"
          defaultValue={name}
          onChange={(event) => setName(event.target.value)}
        />
        <br />
        <Input
          type="text"
          name="description"
          defaultValue={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {/* if ally or enemy, display the questions */}
        {type === "ally" || type === "enemy" ? (
          <React.Fragment>
            <Input
              type="text"
              name="Where does your allegiance lie?"
              defaultValue={question1}
              onChange={(event) => setQuestion1(event.target.value)}
            />

            <Input
              type="text"
              name="What is your greatest strength?"
              defaultValue={question2}
              onChange={(event) => setQuestion2(event.target.value)}
            />
            <br />

            <Input
              type="text"
              name="What is your greatest weakness?"
              defaultValue={question3}
              onChange={(event) => setQuestion3(event.target.value)}
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Input
              type="text"
              name="What does your pet do when they get bored?"
              defaultValue={question1}
              onChange={(event) => setQuestion1(event.target.value)}
            />
            <Input
              type="text"
              name="How do they defend themself?"
              defaultValue={question2}
              onChange={(event) => setQuestion2(event.target.value)}
            />
            <Input
              type="text"
              name="What is their best quality?"
              defaultValue={question3}
              onChange={(event) => setQuestion3(event.target.value)}
            />
          </React.Fragment>
        )}
        <h2>Chat with {name}</h2>

        <Box className={styles["chatBox"]}>
          <div className={styles["messages"]}>
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
          </Box>
          <form onSubmit={handleSubmit}>
            <Input
            className={styles["message"]}
              autoComplete="off"
              type="text"
              name=""
              value={input}
              onInput={handleChange}
              onChange={handleChange}
            />
            <Button
              className={styles["button"]}
              onSubmit={handleSubmit}
              type="submit"
            >
              Send
            </Button>
            </form>
      </div>
    </div>
  )
}
