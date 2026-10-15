import React, { useState } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import useLibraryLocale from "./useLibraryLocale";
import type { Division, LibraryDocument } from "../data/library";
import {
  divisionTrail,
  withinDivision,
  normalizeSearch,
  divisionMatches,
} from "../data/hierarchy";

type IconName =
  | "search"
  | "close"
  | "file"
  | "pdf"
  | "guide"
  | "chevron"
  | "library";

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3.5 3.5" />
      </>
    ),
    close: <path d="m4 4 8 8M12 4l-8 8" />,
    file: (
      <>
        <path d="M4 1.5h5.5L13 5v9.5H4z" />
        <path d="M9.5 1.5V5H13" />
      </>
    ),
    pdf: (
      <>
        <path d="M4 1.5h5.5L13 5v9.5H4z" />
        <path d="M9.5 1.5V5H13M6 12V8.5h1.4a1.25 1.25 0 0 1 0 2.5H6" />
      </>
    ),
    guide: (
      <>
        <path d="M2.5 3h4a2 2 0 0 1 2 2v8.5a1.5 1.5 0 0 0-1.5-1.5h-4.5z" />
        <path d="M13.5 3h-4a2 2 0 0 0-2 2v8.5a1.5 1.5 0 0 1 1.5-1.5h4.5z" />
      </>
    ),
    chevron: <path d="m6 3.5 4.5 4.5L6 12.5" />,
    library: <path d="M2.5 2.5v11M6.5 2.5v11M9.5 2.5l4 11" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

type Props = { division?: string; category?: string | null };
export default function Library({ division, category }: Props) {
  const { t, catalog, ja } = useLibraryLocale();
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("all");
  const currentDivision = catalog.divisions.find(
    (item) => item.slug === division,
  );
  const currentCategory = catalog.categories.find(
    (item) => item.slug === category,
  );
  const trail = divisionTrail(catalog.divisions, division);
  const childrenOf = (slug?: string) =>
    catalog.divisions.filter((item) => item.parent === slug);
  const countDocuments = (slug: string) =>
    catalog.documents.filter((doc) =>
      withinDivision(catalog.divisions, doc.division, slug),
    ).length;
  const scoped = catalog.documents.filter(
    (doc) =>
      withinDivision(catalog.divisions, doc.division, division) &&
      (!category || doc.category === category),
  );
  const search = normalizeSearch(query.trim());
  const documents = scoped
    .filter(
      (doc) =>
        (format === "all" || doc.format === format) &&
        normalizeSearch(
          [
            doc.title,
            doc.description,
            doc.language,
            ...divisionTrail(catalog.divisions, doc.division).flatMap(
              (item) => [
                item.name,
                item.englishName || "",
                item.japanese,
                item.romaji,
              ],
            ),
            doc.category,
          ].join(" "),
        ).includes(search),
    )
    .sort((a, b) => b.updated.localeCompare(a.updated));
  const matchesBranch = (item: Division): boolean =>
    divisionMatches(item, search) || childrenOf(item.slug).some(matchesBranch);
  const divisions = childrenOf(division).filter(matchesBranch);
  const departments = childrenOf();
  const sections = catalog.divisions.filter((item) => item.parent);
  const filtering = Boolean(query) || format !== "all";
  const otherName = (item: Division) =>
    ja ? item.englishName : item.japanese;
  const categoryName = (slug: string) =>
    catalog.categories.find((item) => item.slug === slug)?.name;
  const formatIcon = (doc: LibraryDocument): IconName =>
    doc.format === "PDF" ? "pdf" : doc.format === "Guide" ? "guide" : "file";

  function sidebarTree(items: Division[]) {
    return (
      <ul className="division-tree">
        {items.map((item) => {
          const count = countDocuments(item.slug);
          const selected = division === item.slug;
          return (
            <li key={item.slug}>
              <Link
                className={`side-link ${selected ? "selected" : ""}`}
                to={`/${item.slug}/`}
                aria-current={selected ? "page" : undefined}
              >
                <span className="side-link-text">{item.name}</span>
                {count > 0 && <span className="count">{count}</span>}
              </Link>
              {childrenOf(item.slug).length > 0 &&
                sidebarTree(childrenOf(item.slug))}
            </li>
          );
        })}
      </ul>
    );
  }

  const title = currentCategory
    ? currentCategory.name
    : currentDivision
      ? currentDivision.name
      : t("Document library");

  return (
    <Layout
      title={
        currentDivision
          ? `${currentDivision.name}${currentCategory ? " · " + currentCategory.name : ""}`
          : t("Document library")
      }
      description={t(
        "Find manuals, guides, and documents across Kyoritsu divisions.",
      )}
    >
      <div className="library-shell">
        <aside className="library-sidebar" aria-label={t("Library navigation")}>
          <nav>
            <Link
              className={`side-link side-link-all ${!division ? "selected" : ""}`}
              to="/"
              aria-current={!division ? "page" : undefined}
            >
              <Icon name="library" />
              <span className="side-link-text">{t("All documents")}</span>
              <span className="count">{catalog.documents.length}</span>
            </Link>
            <div className="sidebar-label">
              <span>{t("Departments")}</span>
              <span>{departments.length}</span>
            </div>
            {sidebarTree(departments)}
          </nav>
        </aside>
        <main className="library-main" id="library-content">
          <nav className="library-breadcrumb" aria-label={t("Breadcrumb")}>
            <Link to="/">{t("Library")}</Link>
            {trail.map((item) => (
              <React.Fragment key={item.slug}>
                <Icon name="chevron" size={12} />
                <Link to={`/${item.slug}/`}>{item.name}</Link>
              </React.Fragment>
            ))}
            {currentCategory && (
              <>
                <Icon name="chevron" size={12} />
                <span aria-current="page">{currentCategory.name}</span>
              </>
            )}
          </nav>
          <header className="library-head">
            <div className="library-head-text">
              <h1>{title}</h1>
              {currentDivision && (
                <p className="division-names">
                  <span lang={ja ? "en" : "ja"}>
                    {otherName(currentDivision)}
                  </span>
                  <span className="division-romaji" lang="en">
                    {currentDivision.romaji}
                  </span>
                </p>
              )}
              <p className="library-lede">
                {currentDivision
                  ? childrenOf(currentDivision.slug).length
                    ? t(
                        "Documents published by this department and its sections.",
                      )
                    : trail.length > 1
                      ? `${t("Section of")} ${trail[trail.length - 2].name}.`
                      : t("Documents published by this department.")
                  : t(
                      "Manuals, guides, policies, and forms maintained by each department and section.",
                    )}
              </p>
            </div>
            {!division && (
              <dl className="library-facts">
                <div>
                  <dt>{t("Departments")}</dt>
                  <dd>{departments.length}</dd>
                </div>
                <div>
                  <dt>{t("Sections")}</dt>
                  <dd>{sections.length}</dd>
                </div>
                <div>
                  <dt>{t("Documents")}</dt>
                  <dd>{catalog.documents.length}</dd>
                </div>
              </dl>
            )}
          </header>
          <div className="library-toolbar" role="search">
            <label className="search-box">
              <Icon name="search" />
              <span className="sr-only">
                {t("Search document titles, descriptions, and divisions")}
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  division
                    ? t("Search this division…")
                    : t("Search documents or divisions…")
                }
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t("Clear search")}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </label>
            <label className="format-select">
              <span className="sr-only">{t("Document format")}</span>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                <option value="all">{t("All formats")}</option>
                <option value="PDF">PDF</option>
                <option value="Guide">{t("Guides")}</option>
                <option value="File">{t("Files")}</option>
              </select>
            </label>
          </div>
          {division && (
            <nav
              className="category-tabs"
              aria-label={t("Document categories")}
            >
              <Link
                className={!category ? "active" : ""}
                aria-current={!category ? "page" : undefined}
                to={`/${division}/`}
              >
                {t("All documents")}
                <span>{countDocuments(division)}</span>
              </Link>
              {catalog.categories.map((item) => {
                const count = catalog.documents.filter(
                  (doc) =>
                    doc.category === item.slug &&
                    withinDivision(catalog.divisions, doc.division, division),
                ).length;
                return (
                  <Link
                    className={category === item.slug ? "active" : ""}
                    aria-current={category === item.slug ? "page" : undefined}
                    key={item.slug}
                    to={`/${division}/${item.slug}/`}
                  >
                    {item.name}
                    {count > 0 && <span>{count}</span>}
                  </Link>
                );
              })}
            </nav>
          )}
          <section
            className="documents-section"
            aria-labelledby="documents-heading"
          >
            <div className="section-title">
              <h2 id="documents-heading">
                {search
                  ? t("Search results")
                  : currentCategory
                    ? currentCategory.name
                    : t("Documents")}
                <span>{documents.length}</span>
              </h2>
              <span className="section-caption">
                {division
                  ? childrenOf(division).length
                    ? t("Includes section documents")
                    : null
                  : t("Sorted by last update")}
              </span>
            </div>
            <div className="document-table-wrap" aria-live="polite">
              {documents.length > 0 && (
                <table className="document-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("Document")}</th>
                      <th scope="col" className="col-department">
                        {t("Department")}
                      </th>
                      <th scope="col" className="col-format">
                        {t("Format")}
                      </th>
                      <th scope="col" className="col-language">
                        {t("Language")}
                      </th>
                      <th scope="col" className="col-updated">
                        {t("Updated")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const docTrail = divisionTrail(
                        catalog.divisions,
                        doc.division,
                      );
                      const href = `/${doc.division}/${doc.category}/${doc.slug}/`;
                      return (
                        <tr key={`${doc.division}/${doc.category}/${doc.slug}`}>
                          <td className="col-document">
                            <span
                              className={`file-icon file-icon-${doc.format.toLowerCase()}`}
                            >
                              <Icon name={formatIcon(doc)} size={18} />
                            </span>
                            <span className="document-info">
                              <Link className="document-title" to={href}>
                                {doc.title}
                              </Link>
                              <span className="document-description">
                                {doc.description}
                              </span>
                              <span className="document-tags">
                                {docTrail.map((item) => item.name).join(" › ")}
                                <span aria-hidden="true"> · </span>
                                {categoryName(doc.category)}
                                <span aria-hidden="true"> · </span>
                                {doc.language}
                              </span>
                            </span>
                          </td>
                          <td className="col-department">
                            {docTrail.map((item, index) => (
                              <React.Fragment key={item.slug}>
                                {index > 0 && (
                                  <span className="trail-separator">›</span>
                                )}
                                <Link to={`/${item.slug}/`}>{item.name}</Link>
                              </React.Fragment>
                            ))}
                            <span className="cell-note">
                              {categoryName(doc.category)}
                            </span>
                          </td>
                          <td className="col-format">
                            <span
                              className={`format-badge format-${doc.format.toLowerCase()}`}
                            >
                              {t(doc.format)}
                            </span>
                            {doc.sample && (
                              <span className="sample-tag">{t("Sample")}</span>
                            )}
                          </td>
                          <td className="col-language">{doc.language}</td>
                          <td className="col-updated">
                            <time dateTime={doc.updated}>{doc.updated}</time>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!documents.length && (
                <div className="empty-state">
                  <h3>
                    {filtering
                      ? t("No matching documents")
                      : t("No documents published yet")}
                  </h3>
                  <p>
                    {filtering
                      ? t("Try another search or select a different format.")
                      : t(
                          "Documents added to this department will be listed here.",
                        )}
                  </p>
                  {filtering && (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        setQuery("");
                        setFormat("all");
                      }}
                    >
                      {t("Clear filters")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
          {(!division || childrenOf(division).length > 0) && (
            <section className="divisions-section" aria-labelledby="divisions">
              <div className="section-title">
                <Heading as="h2" id="divisions">
                  {t(division ? "Sections" : "Departments")}
                  <span>{divisions.length}</span>
                </Heading>
                {!division && (
                  <span className="section-caption">
                    {`${sections.length} ${t("sections")}`}
                  </span>
                )}
              </div>
              {divisions.length > 0 ? (
                <ul className="directory">
                  {divisions.map((item) => {
                    const count = countDocuments(item.slug);
                    const children = childrenOf(item.slug).filter(
                      (child) =>
                        divisionMatches(item, search) || matchesBranch(child),
                    );
                    return (
                      <li className="directory-entry" key={item.slug}>
                        <div className="directory-head">
                          <Link className="directory-name" to={`/${item.slug}/`}>
                            {item.name}
                          </Link>
                          <span
                            className="directory-other"
                            lang={ja ? "en" : "ja"}
                          >
                            {otherName(item)}
                          </span>
                          <span className="directory-count">
                            {count
                              ? `${count} ${t(count === 1 ? "document" : "documents")}`
                              : t("No documents yet")}
                          </span>
                        </div>
                        {children.length > 0 && (
                          <ul className="directory-sections">
                            {children.map((child) => {
                              const childCount = countDocuments(child.slug);
                              return (
                                <li key={child.slug}>
                                  <Link to={`/${child.slug}/`}>
                                    {child.name}
                                    {childCount > 0 && (
                                      <span className="count">{childCount}</span>
                                    )}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="muted">{t("No divisions match your search.")}</p>
              )}
            </section>
          )}
        </main>
      </div>
    </Layout>
  );
}
