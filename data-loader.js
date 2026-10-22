(function () {
  "use strict";

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function fillList(container, items, renderItem) {
    container.textContent = "";
    items.forEach(function (item) {
      container.appendChild(renderItem(item));
    });
  }

  function applyField(entry, fieldEl, field) {
    if (field === "problem") {
      fieldEl.textContent = "";
      entry.problem.forEach(function (paragraph) {
        fieldEl.appendChild(el("p", null, paragraph));
      });
      return;
    }

    if (field === "process") {
      fillList(fieldEl, entry.process, function (step) {
        var li = document.createElement("li");
        var strong = document.createElement("strong");
        strong.textContent = step.label + ":";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" " + step.text));
        return li;
      });
      return;
    }

    if (field === "outcomes") {
      fillList(fieldEl, entry.outcomes, function (outcome) {
        return el("span", "outcome-chip", outcome);
      });
      return;
    }

    if (field === "tags") {
      fillList(fieldEl, entry.tags, function (tag) {
        return el("span", "btag", tag);
      });
      return;
    }

    if (field.indexOf("feature-") === 0) {
      var parts = field.split("-"); // "feature-0-text" -> ["feature", "0", "text"]
      var feature = entry.features[Number(parts[1])];
      if (feature) fieldEl.textContent = parts[2] === "icon" ? feature.icon : feature.text;
      return;
    }

    // plain text fields: headline, client, context, solution, takeaways
    fieldEl.textContent = entry[field] !== undefined ? entry[field] : "";
  }

  function applyData(root, data) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-project]"), function (projectEl) {
      var entry = data[projectEl.getAttribute("data-project")];
      if (!entry) return;

      try {
        Array.prototype.forEach.call(projectEl.querySelectorAll("[data-field]"), function (fieldEl) {
          // skip fields that belong to a nested [data-project] instead of this one
          if (fieldEl.closest("[data-project]") !== projectEl) return;
          applyField(entry, fieldEl, fieldEl.getAttribute("data-field"));
        });
      } catch (error) {
        console.error("data-loader.js: Failed to apply data to project \"" + projectEl.getAttribute("data-project") + "\": " + error.message);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof PORTFOLIO_DATA === "undefined") {
      console.error("data-loader.js: PORTFOLIO_DATA not found — is data.js loaded before this script?");
      return;
    }
    applyData(document, PORTFOLIO_DATA);
  });
})();
