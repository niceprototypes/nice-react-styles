import { test } from "node:test"
import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { getLocaleDirection, LocaleContextProvider, resolveLocale, useLocale } from "./LocaleContext.ts"

// Renders useLocale() output as "locale|direction"
const Probe = () => {
  const { locale, direction } = useLocale()
  return createElement("span", null, `${locale}|${direction}`)
}

test("explicit props win over document and navigator", () => {
  const value = resolveLocale(
    { locale: "he", dir: "ltr" },
    { documentLang: "en-US", documentDir: "rtl", navigatorLanguage: "fr-FR" }
  )
  assert.deepEqual(value, { locale: "he", direction: "ltr" })
})

test("explicit locale carries its own direction over document dir", () => {
  const value = resolveLocale({ locale: "ar-EG" }, { documentLang: "en", documentDir: "ltr" })
  assert.deepEqual(value, { locale: "ar-EG", direction: "rtl" })
})

test("document lang and dir are used when no explicit props", () => {
  const value = resolveLocale({}, { documentLang: "en-GB", documentDir: "rtl", navigatorLanguage: "fr" })
  assert.deepEqual(value, { locale: "en-GB", direction: "rtl" })
})

test("document dir 'auto' is ignored; direction derived from locale", () => {
  const value = resolveLocale({}, { documentLang: "fa-IR", documentDir: "auto" })
  assert.deepEqual(value, { locale: "fa-IR", direction: "rtl" })
})

test("navigator.language used when document lang is absent", () => {
  assert.deepEqual(resolveLocale({}, { navigatorLanguage: "he-IL" }), { locale: "he-IL", direction: "rtl" })
})

test("falls back to en / ltr with no signals", () => {
  assert.deepEqual(resolveLocale({}, {}), { locale: "en", direction: "ltr" })
})

test("direction derivation: ar-EG and he are rtl, en-US is ltr", () => {
  assert.equal(getLocaleDirection("ar-EG"), "rtl")
  assert.equal(getLocaleDirection("he"), "rtl")
  assert.equal(getLocaleDirection("en-US"), "ltr")
})

test("fallback list is used when Intl.Locale lacks text info", () => {
  const proto = Intl.Locale.prototype as unknown as Record<string, unknown>
  const getTextInfo = Object.getOwnPropertyDescriptor(proto, "getTextInfo")
  const textInfo = Object.getOwnPropertyDescriptor(proto, "textInfo")
  delete proto.getTextInfo
  delete proto.textInfo
  try {
    assert.equal(getLocaleDirection("ar-EG"), "rtl")
    assert.equal(getLocaleDirection("he"), "rtl")
    assert.equal(getLocaleDirection("ckb-IQ"), "rtl")
    assert.equal(getLocaleDirection("en-US"), "ltr")
  } finally {
    if (getTextInfo) Object.defineProperty(proto, "getTextInfo", getTextInfo)
    if (textInfo) Object.defineProperty(proto, "textInfo", textInfo)
  }
})

test("SSR render with no document: explicit props are used", () => {
  assert.equal(typeof document, "undefined")
  const html = renderToString(createElement(LocaleContextProvider, { locale: "ar-EG" }, createElement(Probe)))
  assert.equal(html, "<span>ar-EG|rtl</span>")
})

test("SSR render with no document and no provider falls back to en / ltr", () => {
  assert.equal(renderToString(createElement(Probe)), "<span>en|ltr</span>")
})
