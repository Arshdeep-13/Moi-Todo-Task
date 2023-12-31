import React, { useEffect, useState } from "react";
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk';
import { info, success } from "./utils/toastWrapper";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";
let count = 0;

// ------- Update with your credentials ------------------ //
const logicId = "0x080000597c2cd6a5a6e37ae40e871ef2b840605d4686a7ca81a41808e297607b42aea0"
const mnemonic = "walnut suspect turn present toe idea kidney slush piece believe grant unusual"

const logicDriver = await gettingLogicDriver(
  logicId,
  mnemonic,
  "m/44'/6174'/7020'/0/0"
)

async function gettingLogicDriver(logicId, mnemonic, accountPath) {
  const provider = new VoyageProvider("babylon")
  const wallet = new Wallet(provider)
  await wallet.fromMnemonic(mnemonic, accountPath)
  return await getLogicDriver(logicId, wallet)
}

function App() {
  const [todoName, setTodoName] = useState("");
  const [todos, setTodos] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    getTodos();
  }, []);

  const handleTodoName = (e) => {
    setTodoName(e.currentTarget.value);
  };

  const getTodos = async () => {
    try {
      const tTodos = await logicDriver.persistentState.get("todos")
      setTodos(tTodos)
      setLoading(false);
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    try {
      setAdding(true)
      info("Adding Todo ...");

      const ix = await logicDriver.routines.Add([todoName]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });

      // Waiting for tesseract to be mined
      await ix.wait()

      await getTodos()
      success("Successfully Added");
      setTodoName("")
      setAdding(false)
    } catch (error) {
      console.log(error);
    }
  };

  const markCompleted = async (id) => {
    try {
      setMarking(id)
      const ix = await logicDriver.routines.MarkTodoCompleted([id]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });
      // Waiting for tesseract to be mined
      await ix.wait();

      const tTodos = [...todos];
      tTodos[id].completed = true;
      setTodos(tTodos);
      setMarking(false)
    } catch (error) {
      console.log(error);
    }
  };

  const del = async () => {
    try {
      const selectedTodos = todos.filter((todo) => todo.completed);
      if (selectedTodos.length === 0) {
        alert("Please mark a todo as completed before deleting.");
        return;
      }

      success("Successfully Removed Completed Todos");

      // Filter out completed todos from the state
      const updatedTodos = todos.filter((todo) => !todo.completed);
      setTodos(updatedTodos);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Toaster />
      <section className="section-center">
        <form className="todo-form">
          <p className="alert"></p>
          <h3>Todo buddy</h3>
          <div className="form-control">
            <input
              value={todoName}
              name="todoName"
              onChange={handleTodoName}
              type="text"
              id="todo"
              placeholder="e.g. Attend Moi Event"
            />
            <button onClick={add} type="submit" className="submit-btn">
              {adding ? <Loader color={"#000"} loading={adding} /> : "Add Todo"}
            </button>
          </div>
        </form>

        <div className="del-container" style={{
          display: "flex", justifyContent: "center",
          alignItems: "center", margin: "1rem"
        }}>
          <button onClick={del} type="button" className="submit-btn" style={{ background: "rgb(5 199 5)", borderRadius: "13px" }}>
            {deleting ? <Loader color={"#000"} loading={deleting} /> : "Delete Todo"}
          </button>
        </div>

        {!loading ? <div className="todo-container show-container">
          {todos.map((todo, index) => {
            return (
              <div className="todo-list" key={count++}>
                {todo.name}
                {todo.completed ? (
                  <img className="icon" src="/images/check.svg" />
                ) : (
                  <span
                    onClick={() => markCompleted(index)}
                    className="underline text-red pointer"
                  >
                    {marking === index ? <Loader color={"#000"} loading={marking === 0 ? true : marking} /> : "Mark Completed!"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
          :
          <div style={{ marginTop: "20px" }}>
            <Loader color={"#000"} loading={loading} />
          </div>}
      </section>
    </>
  );
}

export default App;
