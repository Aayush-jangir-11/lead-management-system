import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { SALES_REPS, STATUS_OPTIONS } from "./LeadsHeaderStats";

export default function ImportLeadsModal({
  isOpen,
  onClose,
  onImportSuccess,
  salesReps = SALES_REPS,
  defaultRep = salesReps[0]?.name || "Unassigned",
  stages = [],
}) {
  const fileInputRef = useRef(null);

  const stageOptions = stages && stages.length > 0
    ? stages.map((s) => s.name)
    : STATUS_OPTIONS.filter((s) => s !== "All");

  const [file, setFile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [defaultRepName, setDefaultRepName] = useState(defaultRep);
  const [defaultStage, setDefaultStage] = useState(stages[0]?.name || "New Lead");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Excel column names ko standard format mein convert karta hai.
  const cleanKey = (key) =>
    String(key).toLowerCase().replace(/[^a-z0-9]/g, "");

  // Excel mein different column names hone par bhi value find karta hai.
  const getValue = (row, possibleNames) => {
    const rowData = {};

    Object.keys(row).forEach((key) => {
      rowData[cleanKey(key)] = row[key];
    });

    for (const name of possibleNames) {
      const value = rowData[cleanKey(name)];

      if (value !== undefined && value !== null && value !== "") {
        return String(value).trim();
      }
    }

    return "";
  };

  // Excel ki ek row ko lead object mein convert karta hai.
  const convertRow = (row) => {
    const company = getValue(row, [
      "company",
      "company name",
      "organization",
      "account",
      "firm",
    ]);

    const name = getValue(row, [
      "name",
      "contact name",
      "lead name",
      "full name",
      "contact person",
    ]);

    const rawValue = getValue(row, [
      "value",
      "deal value",
      "budget",
      "amount",
      "revenue",
      "deal size",
    ]);

    const priority = getValue(row, ["priority", "urgency"]);

    const validPriorities = ["Urgent", "High", "Medium", "Low"];

    return {
      company,
      name,

      title:
        getValue(row, [
          "title",
          "job title",
          "designation",
          "role",
        ]) || "Decision Maker",

      email: getValue(row, [
        "email",
        "email address",
        "work email",
        "mail",
      ]),

      phone: getValue(row, [
        "phone",
        "phone number",
        "mobile",
        "mobile number",
        "contact number",
      ]),

      location:
        getValue(row, [
          "location",
          "city",
          "address",
          "region",
          "state",
        ]) || "India",

      value: Number(rawValue.replace(/[^0-9.-]/g, "")) || 0,

      status:
        getValue(row, [
          "status",
          "stage",
          "lead status",
          "pipeline stage",
        ]) || defaultStage,

      priority: validPriorities.includes(priority)
        ? priority
        : "Medium",

      source:
        getValue(row, [
          "source",
          "lead source",
          "channel",
          "medium",
        ]) || "Excel Bulk Import",

      notes: getValue(row, [
        "notes",
        "description",
        "remarks",
        "comments",
      ]),

      assignedRep:
        getValue(row, [
          "assigned rep",
          "sales rep",
          "owner",
          "assignee",
        ]) || defaultRepName,

      isValid: Boolean(company && name),
    };
  };

  // Excel ya CSV file read karta hai.
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["xlsx", "xls", "csv"].includes(extension)) {
      setError("Please select an .xlsx, .xls or .csv file.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setLoading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, {
          type: "array",
        });

        const firstSheet = workbook.SheetNames[0];

        if (!firstSheet) {
          throw new Error("No worksheet found in this file.");
        }

        const worksheet = workbook.Sheets[firstSheet];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        if (rows.length === 0) {
          throw new Error("No data rows found.");
        }

        setLeads(rows.map(convertRow));
      } catch (err) {
        setError(err.message || "Unable to read this file.");
        setFile(null);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Could not read the selected file.");
      setLoading(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Valid aur invalid leads count.
  const validLeads = leads.filter((lead) => lead.isValid);

  const invalidCount = leads.length - validLeads.length;

  // Valid leads ko parent component ko send karta hai.
  const handleImport = async () => {
    if (validLeads.length === 0 || !onImportSuccess) return;

    setLoading(true);
    setError("");

    try {
      const formattedLeads = validLeads.map((lead, index) => {
        const rep =
          salesReps.find(
            (item) =>
              item.name.toLowerCase() ===
              lead.assignedRep.toLowerCase()
          ) ||
          salesReps.find(
            (item) => item.name === defaultRepName
          ) ||
          salesReps[0] ||
          { name: defaultRepName };

        const score = Math.floor(65 + Math.random() * 30);
        const matchedStage =
          stages.find(
            (s) => s.name?.toLowerCase() === lead.status?.toLowerCase()
          ) ||
          stages.find(
            (s) => s.name?.toLowerCase() === defaultStage?.toLowerCase()
          ) ||
          stages[0];

        return {
          id: `LD-${Date.now()}-${index}`,

          company: lead.company,
          name: lead.name,
          title: lead.title,
          email: lead.email,
          phone: lead.phone,
          location: lead.location,
          value: lead.value,
          status: matchedStage?.name || lead.status || defaultStage,
          stage: matchedStage?._id || null,
          priority: lead.priority,

          score,

          scoreGrade:
            score >= 80
              ? "Hot"
              : score >= 50
                ? "Warm"
                : "Cold",

          source: lead.source,
          assignedRep: rep.name,

          repAvatar:
            rep.avatar ||
            rep.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2),

          repColor: rep.color || "bg-emerald-600",

          createdAt: new Date().toISOString(),

          lastContacted: "Imported just now",

          notes: lead.notes,

          tags: ["Excel Import"],

          timeline: [
            {
              type: "lead",
              title: "Imported via Excel / CSV",
              author: "Excel Import",
              time: "Just now",
              note: `Lead assigned to ${rep.name}.`,
            },
          ],

          tasks: [],
        };
      });

      await onImportSuccess(formattedLeads, {
        totalCount: leads.length,
        validCount: validLeads.length,
        skippedCount: invalidCount,
        fileName: file?.name,
      });

      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Form reset karta hai.
  const resetForm = () => {
    setFile(null);
    setLeads([]);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Import Leads
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500"
          >
            Close
          </button>
        </div>

        {/* Default Settings */}
        <div className="mb-4 flex flex-wrap gap-4">

          {/* Default Salesperson */}
          <label className="text-sm">
            Default Salesperson:

            <select
              value={defaultRepName}
              onChange={(event) =>
                setDefaultRepName(event.target.value)
              }
              className="ml-2 rounded border p-2"
            >
              {salesReps.map((rep) => (
                <option key={rep.name} value={rep.name}>
                  {rep.name}
                </option>
              ))}
            </select>
          </label>

          {/* Default Stage */}
          <label className="text-sm">
            Default Stage:

            <select
              value={defaultStage}
              onChange={(event) =>
                setDefaultStage(event.target.value)
              }
              className="ml-2 rounded border p-2"
            >
              {stageOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(event) =>
            handleFile(event.target.files[0])
          }
          className="mb-4 block w-full rounded border p-3"
        />

        {/* Error */}
        {error && (
          <p className="mb-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p className="mb-3 text-sm">
            Please wait...
          </p>
        )}

        {/* Selected File */}
        {file && (
          <p className="mb-3 text-sm text-gray-600">
            File: {file.name}
          </p>
        )}

        {/* Preview */}
        {leads.length > 0 && (
          <>
            <div className="mb-3 flex gap-4 text-sm">
              <span>Total: {leads.length}</span>

              <span className="text-green-700">
                Valid: {validLeads.length}
              </span>

              <span className="text-red-600">
                Invalid: {invalidCount}
              </span>
            </div>

            <div className="max-h-64 overflow-auto rounded border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="p-2">Status</th>
                    <th className="p-2">Company</th>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Assigned To</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.slice(0, 10).map((lead, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        {lead.isValid
                          ? "Valid"
                          : "Missing required fields"}
                      </td>

                      <td className="p-2">
                        {lead.company || "-"}
                      </td>

                      <td className="p-2">
                        {lead.name || "-"}
                      </td>

                      <td className="p-2">
                        {lead.email || "-"}
                      </td>

                      <td className="p-2">
                        {lead.assignedRep}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="rounded bg-gray-100 px-4 py-2 text-sm"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={validLeads.length === 0 || loading}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Import {validLeads.length} Leads
          </button>

        </div>
      </div>
    </div>
  );
}