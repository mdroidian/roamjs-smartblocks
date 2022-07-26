import { Button, InputGroup, Intent, Label } from "@blueprintjs/core";
import React, { useMemo, useState, useRef, useEffect } from "react";
import MenuItemSelect from "roamjs-components/components/MenuItemSelect";
import { getCleanCustomWorkflows } from "./core";
import type { OnloadArgs } from "roamjs-components/types/native";

const HotKeyPanel = (extensionAPI: OnloadArgs["extensionAPI"]) => () => {
  const workflows = useMemo(
    () =>
      getCleanCustomWorkflows().sort(({ name: a }, { name: b }) =>
        a.localeCompare(b)
      ),
    []
  );
  const workflowNamesByUid = useMemo(
    () => Object.fromEntries(workflows.map((wf) => [wf.uid, wf.name])),
    []
  );
  const [keys, setKeys] = useState(
    () => extensionAPI.settings.get("hot-keys") as Record<string, string>
  );
  return (
    <div
      style={{
        width: "100%",
        minWidth: 256,
      }}
    >
      {Object.entries(keys).map(([key, value], order) => {
        const inputRef = useRef<HTMLInputElement>(null);
        useEffect(() => {
          inputRef.current.className = "rm-extensions-settings";
          inputRef.current.style.minWidth = "100%";
          inputRef.current.style.maxWidth = "100%";
        }, [inputRef]);
        return (
          <div key={order} className={"flex items-center gap-1"}>
            <Label className="flex-shrink-0">
              Hot Key
              <InputGroup
                placeholder={"Type the keys themselves"}
                value={key}
                onChange={() => true}
                className={"w-full"}
                inputRef={inputRef}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const parts = key ? key.split("+") : [];
                  const formatValue = (
                    e.key === "Backspace"
                      ? parts.slice(0, -1)
                      : ["Shift", "Control", "Alt", "Meta"].includes(e.key)
                      ? Array.from(
                          new Set(parts.concat(e.key.toLowerCase()))
                        ).sort((a, b) => b.length - a.length)
                      : parts.concat(e.key.toLowerCase())
                  ).join("+");
                  if (formatValue === key) return;
                  const error = !formatValue || !!keys[formatValue];
                  const newKeys = Object.fromEntries(
                    Object.entries(keys).map((k, o) =>
                      o !== order ? k : [formatValue, k[1]]
                    )
                  );
                  setKeys(newKeys);
                  if (!error) {
                    extensionAPI.settings.set("hot-keys", newKeys);
                  }
                }}
                intent={Intent.NONE}
              />
            </Label>
            <Label className={"flex-shrink-1"}>
              SmartBlock
              <MenuItemSelect
                activeItem={value}
                items={workflows.map((w) => w.uid)}
                onItemSelect={(e) => {
                  const newKeys = Object.fromEntries(
                    Object.entries(keys).map((k, o) =>
                      o !== order ? k : [k[0], e]
                    )
                  );
                  setKeys(newKeys);
                  extensionAPI.settings.set("hot-keys", newKeys);
                }}
                transformItem={(e) => workflowNamesByUid[e]}
              />
            </Label>
            <Button
              icon={"trash"}
              style={{ width: 32, height: 32 }}
              minimal
              onClick={() => {
                const newKeys = Object.fromEntries(
                  Object.entries(keys).filter((_, o) => o !== order)
                );
                setKeys(newKeys);
                extensionAPI.settings.set("hot-keys", newKeys);
              }}
            />
          </div>
        );
      })}
      <Button
        text={"Add Hot Key"}
        intent={Intent.PRIMARY}
        rightIcon={"plus"}
        minimal
        style={{ marginTop: 8 }}
        onClick={async () => {
          const randomWorkflow =
            workflows[Math.floor(Math.random() * workflows.length)];
          const newKeys = Object.fromEntries(
            Object.entries(keys).concat([["control+o", randomWorkflow.uid]])
          );
          setKeys(newKeys);
          extensionAPI.settings.set("hot-keys", newKeys);
        }}
      />
    </div>
  );
};

export default HotKeyPanel;
