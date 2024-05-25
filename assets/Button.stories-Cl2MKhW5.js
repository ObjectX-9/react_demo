import{f as T}from"./index-2ywIqtt-.js";import{R as q}from"./index-BBkUAzwr.js";const e={"storybook-button":"_storybook-button_1m9v8_2","storybook-button--primary":"_storybook-button--primary_1m9v8_11","storybook-button--secondary":"_storybook-button--secondary_1m9v8_15","storybook-button--small":"_storybook-button--small_1m9v8_20","storybook-button--medium":"_storybook-button--medium_1m9v8_24","storybook-button--large":"_storybook-button--large_1m9v8_28"},k=({primary:_=!1,size:f="medium",backgroundColor:v,label:B,...h})=>{const S=_?e["storybook-button--primary"]:e["storybook-button--secondary"];return q.createElement("button",{type:"button",className:[e["storybook-button"],e[`storybook-button--${f}`],S].join(" "),style:{backgroundColor:v},...h},B)};k.__docgenInfo={description:"Primary UI component for user interaction",methods:[],displayName:"Button",props:{primary:{required:!1,tsType:{name:"boolean"},description:"Is this the principal call to action on the page?",defaultValue:{value:"false",computed:!1}},backgroundColor:{required:!1,tsType:{name:"string"},description:"What background color to use"},size:{required:!1,tsType:{name:"union",raw:"'small' | 'medium' | 'large'",elements:[{name:"literal",value:"'small'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'large'"}]},description:"How large should the button be?",defaultValue:{value:"'medium'",computed:!1}},label:{required:!0,tsType:{name:"string"},description:"Button contents"},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Optional click handler"}}};const w={title:"通用/Button",component:k,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{backgroundColor:{control:"color"}},args:{onClick:T()}},o={args:{primary:!0,label:"Button"}},t={args:{label:"Button"}},r={args:{size:"large",label:"Button"}},a={args:{size:"small",label:"Button"}};var s,n,l;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    primary: true,
    label: "Button"
  }
}`,...(l=(n=o.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};var u,m,i;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    label: "Button"
  }
}`,...(i=(m=t.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var c,d,p;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    size: "large",
    label: "Button"
  }
}`,...(p=(d=r.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var b,y,g;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    size: "small",
    label: "Button"
  }
}`,...(g=(y=a.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};const I=["Primary","Secondary","Large","Small"];export{r as Large,o as Primary,t as Secondary,a as Small,I as __namedExportsOrder,w as default};
