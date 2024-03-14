export const deviceFrames = [
    {
        title: 'iPhone 14 Pro Max',
        width: 430,
        height: 932,
    },
    {
        title: 'iPhone 14 Pro',
        width: 393,
        height: 852,
    },
    {
        title: 'iPhone 14',
        width: 390,
        height: 844,
    },
];

export const initialReactNativeComponents = [
    {
        value: 'activityIndicator',
        label: 'ActivityIndicator',
    },
    {
        value: 'button',
        label: 'Button',
    },
    {
        value: 'flatList',
        label: 'FlatList',
    },
    {
        value: 'image',
        label: 'Image',
    },
    {
        value: 'imageBackground',
        label: 'ImageBackground',
    },
    {
        value: 'keyboardAvoidingView',
        label: 'KeyboardAvoidingView',
    },
    {
        value: 'modal',
        label: 'Modal',
    },
    {
        value: 'pressable',
        label: 'Pressable',
    },
    {
        value: 'refreshControl',
        label: 'RefreshControl',
    },
    {
        value: 'scrollView',
        label: 'ScrollView',
    },
    {
        value: 'sectionList',
        label: 'SectionList',
    },
    {
        value: 'statusBar',
        label: 'StatusBar',
    },
    {
        value: 'switch',
        label: 'Switch',
    },
    {
        value: 'text',
        label: 'Text',
    },
    {
        value: 'textInput',
        label: 'TextInput',
    },
    {
        value: 'touchableHighlight',
        label: 'TouchableHighlight',
    },
    {
        value: 'touchableOpacity',
        label: 'TouchableOpacity',
    },
    {
        value: 'touchableWithoutFeedback',
        label: 'TouchableWithoutFeedback',
    },
    {
        value: 'view',
        label: 'View',
    },
    {
        value: 'virtualizedList',
        label: 'VirtualizedList',
    },
];

export const typesWithoutChildren = ['input', 'image'];

interface SearchObject {
    tag: string;
    defaultValue: string;
    values?: any[];
    prefix?: string;
}

export const PropsValues: Record<string, SearchObject> = {
    testid: {
        tag: 'testID',
        defaultValue: '',
    },
    text: {
        tag: 'text',
        defaultValue: '',
    },
};

export const StylesValues: Record<string, SearchObject> = {
    aligncontent: {
        tag: 'alignContent',
        defaultValue: 'flex-start',
        values: ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'],
    },
    alignitems: {
        tag: 'alignItems',
        defaultValue: 'flex-start',
        values: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    },
    alignself: {
        tag: 'alignSelf',
        defaultValue: 'auto',
        values: ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    },
    aspectratio: {
        tag: 'aspectRatio',
        defaultValue: '',
    },
    borderbottomwidth: {
        tag: 'borderBottomWidth',
        defaultValue: '0',
    },
    borderendwidth: {
        tag: 'borderEndWidth',
        defaultValue: '0',
    },
    borderleftwidth: {
        tag: 'borderLeftWidth',
        defaultValue: '0',
    },
    borderrightwidth: {
        tag: 'borderRightWidth',
        defaultValue: '0',
    },
    borderstartwidth: {
        tag: 'borderStartWidth',
        defaultValue: '0',
    },
    bordertopwidth: {
        tag: 'borderTopWidth',
        defaultValue: '0',
    },
    borderwidth: {
        tag: 'borderWidth',
        defaultValue: '0',
    },
    bottom: {
        tag: 'bottom',
        defaultValue: 'auto',
    },
    display: {
        tag: 'display',
        defaultValue: 'flex',
        values: ['none', 'flex', 'block'],
    },
    end: {
        tag: 'end',
        defaultValue: 'auto',
    },
    flex: {
        tag: 'flex',
        defaultValue: '0',
    },
    flexBasis: {
        tag: 'flexBasis',
        defaultValue: 'auto',
    },
    flexdirection: {
        tag: 'flexDirection',
        defaultValue: 'row',
        values: ['row', 'column', 'row-reverse', 'column-reverse'],
    },
    rowgap: {
        tag: 'rowGap',
        defaultValue: '0',
    },
    gap: {
        tag: 'gap',
        defaultValue: '0',
    },
    columngap: {
        tag: 'columnGap',
        defaultValue: '0',
    },
    flexgrow: {
        tag: 'flexGrow',
        defaultValue: '0',
    },
    flexshrink: {
        tag: 'flexShrink',
        defaultValue: '0',
    },
    flexwrap: {
        tag: 'flexWrap',
        defaultValue: 'nowrap',
        values: ['wrap', 'nowrap', 'wrap-reverse'],
    },
    height: {
        tag: 'height',
        defaultValue: 'auto',
    },
    justifycontent: {
        tag: 'justifyContent',
        defaultValue: 'flex-start',
        values: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    },
    left: {
        tag: 'left',
        defaultValue: '0',
    },
    margin: {
        tag: 'margin',
        defaultValue: '0',
    },
    marginbottom: {
        tag: 'marginBottom',
        defaultValue: '0',
    },
    marginend: {
        tag: 'marginEnd',
        defaultValue: '0',
    },
    marginhorizontal: {
        tag: 'marginHorizontal',
        defaultValue: '0',
    },
    marginleft: {
        tag: 'marginLeft',
        defaultValue: '0',
    },
    marginright: {
        tag: 'marginRight',
        defaultValue: '0',
    },
    marginstart: {
        tag: 'marginStart',
        defaultValue: '0',
    },
    margintop: {
        tag: 'marginTop',
        defaultValue: '0',
    },
    marginvertical: {
        tag: 'marginVertical',
        defaultValue: '0',
    },
    maxheight: {
        tag: 'maxHeight',
        defaultValue: 'auto',
    },
    minheight: {
        tag: 'minHeight',
        defaultValue: 'auto',
    },
    maxwidth: {
        tag: 'maxWidth',
        defaultValue: 'auto',
    },
    minwidth: {
        tag: 'minWidth',
        defaultValue: 'auto',
    },
    overflow: {
        tag: 'overflow',
        defaultValue: 'visible',
        values: ['visible', 'hidden', 'scroll'],
    },
    padding: {
        tag: 'padding',
        defaultValue: '0',
    },
    paddingbottom: {
        tag: 'paddingBottom',
        defaultValue: '0',
    },
    paddingend: {
        tag: 'paddingEnd',
        defaultValue: '0',
    },
    paddinghorizontal: {
        tag: 'paddingHorizontal',
        defaultValue: '0',
    },
    paddingleft: {
        tag: 'paddingLeft',
        defaultValue: '0',
    },
    paddingright: {
        tag: 'paddingRight',
        defaultValue: '0',
    },
    paddingstart: {
        tag: 'paddingStart',
        defaultValue: '0',
    },
    paddingtop: {
        tag: 'paddingTop',
        defaultValue: '0',
    },
    paddingvertical: {
        tag: 'paddingVertical',
        defaultValue: '0',
    },
    position: {
        tag: 'position',
        defaultValue: 'relative',
        values: ['absolute', 'relative'],
    },
    right: {
        tag: 'right',
        defaultValue: '0',
    },
    start: {
        tag: 'start',
        defaultValue: '0',
    },
    top: {
        tag: 'top',
        defaultValue: '0',
    },
    width: {
        tag: 'width',
        defaultValue: 'auto',
    },
    zindex: {
        tag: 'zIndex',
        defaultValue: '1',
    },
    direction: {
        tag: 'direction',
        defaultValue: 'inherit',
        values: ['inherit', 'ltr', 'rtl'],
        prefix: 'iOS',
    },
    shadowcolor: {
        tag: 'shadowColor',
        defaultValue: '',
    },
    shadowoffset: {
        tag: 'shadowOffset',
        defaultValue: '',
    },
    shadowopacity: {
        tag: 'shadowOpacity',
        defaultValue: '0',
    },
    shadowradius: {
        tag: 'shadowRadius',
        defaultValue: '0',
    },
    perspective: {
        tag: 'perspective',
        defaultValue: '0',
    },
    rotate: {
        tag: 'rotate',
        defaultValue: '',
    },
    rotatex: {
        tag: 'rotateX',
        defaultValue: '',
    },
    rotatey: {
        tag: 'rotateY',
        defaultValue: '',
    },
    rotatez: {
        tag: 'rotateZ',
        defaultValue: '',
    },
    scale: {
        tag: 'scale',
        defaultValue: '0',
    },
    scalex: {
        tag: 'scaleX',
        defaultValue: '0',
    },
    scaley: {
        tag: 'scaleY',
        defaultValue: '0',
    },
    translatex: {
        tag: 'translateX',
        defaultValue: '0',
    },
    translatey: {
        tag: 'translateY',
        defaultValue: '0',
    },
    skewx: {
        tag: 'skewX',
        defaultValue: '',
    },
    skewy: {
        tag: 'skewY',
        defaultValue: '',
    },
    matrix: {
        tag: 'matrix',
        defaultValue: '',
    },
    transformorigin: {
        tag: 'transformOrigin',
        defaultValue: '',
    },
    backfacevisibility: {
        tag: 'backfaceVisibility',
        defaultValue: 'visible',
        values: ['visible', 'hidden'],
    },
    backgroundcolor: {
        tag: 'backgroundColor',
        defaultValue: '',
    },
    borderblockcolor: {
        tag: 'borderBlockColor',
        defaultValue: '',
    },
    borderblockEndcolor: {
        tag: 'borderBlockEndColor',
        defaultValue: '',
    },
    borderblockstartcolor: {
        tag: 'borderBlockStartColor',
        defaultValue: '',
    },
    borderbottomcolor: {
        tag: 'borderBottomColor',
        defaultValue: '',
    },
    borderbottomendradius: {
        tag: 'borderBottomEndRadius',
        defaultValue: '0',
    },
    borderbottomleftradius: {
        tag: 'borderBottomLeftRadius',
        defaultValue: '0',
    },
    borderbottomrightradius: {
        tag: 'borderBottomRightRadius',
        defaultValue: '0',
    },
    borderbottomstartradius: {
        tag: 'borderBottomStartRadius',
        defaultValue: '0',
    },
    bordercolor: {
        tag: 'borderColor',
        defaultValue: '',
    },
    bordercurve: {
        tag: 'borderCurve',
        defaultValue: 'circular',
        values: ['circular', 'continuous'],
        prefix: 'iOS',
    },
    borderendcolor: {
        tag: 'borderEndColor',
        defaultValue: '',
    },
    borderendendradius: {
        tag: 'borderEndEndRadius',
        defaultValue: '0',
    },
    borderendstartradius: {
        tag: 'borderEndStartRadius',
        defaultValue: '0',
    },
    borderleftcolor: {
        tag: 'borderLeftColor',
        defaultValue: '',
    },
    borderradius: {
        tag: 'borderRadius',
        defaultValue: '0',
    },
    borderrightcolor: {
        tag: 'borderRightColor',
        defaultValue: '',
    },
    borderstartcolor: {
        tag: 'borderStartColor',
        defaultValue: '',
    },
    borderstartendradius: {
        tag: 'borderStartEndRadius',
        defaultValue: '0',
    },
    borderstartstartradius: {
        tag: 'borderStartStartRadius',
        defaultValue: '0',
    },
    borderstyle: {
        tag: 'borderStyle',
        defaultValue: 'solid',
        values: ['solid', 'dotted', 'dashed'],
    },
    bordertopcolor: {
        tag: 'borderTopColor',
        defaultValue: '',
    },
    bordertopendradius: {
        tag: 'borderTopEndRadius',
        defaultValue: '0',
    },
    bordertopleftradius: {
        tag: 'borderTopLeftRadius',
        defaultValue: '0',
    },
    bordertoprightradius: {
        tag: 'borderTopRightRadius',
        defaultValue: '0',
    },
    bordertopstartradius: {
        tag: 'borderTopStartRadius',
        defaultValue: '0',
    },
    opacity: {
        tag: 'opacity',
        defaultValue: '0',
    },
    elevation: {
        tag: 'elevation',
        defaultValue: '0',
        prefix: 'Android',
    },
    fontvariant: {
        tag: 'fontVariant',
        defaultValue: '',
    },
    textdecorationcolor: {
        tag: 'textDecorationColor',
        defaultValue: '',
    },
    textdecorationstyle: {
        tag: 'textDecorationStyle',
        defaultValue: 'solid',
        values: ['solid', 'double', 'dotted', 'dashed'],
    },
    writingdirection: {
        tag: 'writingDirection',
        defaultValue: 'auto',
        values: ['auto', 'ltr', 'rtl'],
    },
    textalignvertical: {
        tag: 'textAlignVertical',
        defaultValue: 'auto',
        values: ['auto', 'top', 'bottom', 'center'],
    },
    verticalalign: {
        tag: 'verticalAlign',
        defaultValue: 'auto',
        values: ['auto', 'top', 'bottom', 'middle'],
    },
    color: {
        tag: 'color',
        defaultValue: '',
    },
    fontfamily: {
        tag: 'fontFamily',
        defaultValue: '',
    },
    fontsize: {
        tag: 'fontSize',
        defaultValue: '0',
    },
    fontstyle: {
        tag: 'fontStyle',
        defaultValue: 'normal',
        values: ['normal', 'italic'],
    },
    fontweight: {
        tag: 'fontWeight',
        defaultValue: 'normal',
        values: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    },
    letterspacing: {
        tag: 'letterSpacing',
        defaultValue: '0',
    },
    lineheight: {
        tag: 'lineHeight',
        defaultValue: '0',
    },
    textalign: {
        tag: 'textAlign',
        defaultValue: 'auto',
        values: ['auto', 'left', 'right', 'center', 'justify'],
    },
    textdecorationline: {
        tag: 'textDecorationLine',
        defaultValue: 'none',
        values: ['none', 'underline', 'line-through', 'underline line-through'],
    },
    textshadowcolor: {
        tag: 'textShadowColor',
        defaultValue: '',
    },
    textshadowoffset: {
        tag: 'textShadowOffset',
        defaultValue: '',
    },
    textshadowradius: {
        tag: 'textShadowRadius',
        defaultValue: '0',
    },
    texttransform: {
        tag: 'textTransform',
        defaultValue: 'none',
        values: ['none', 'capitalize', 'uppercase', 'lowercase'],
    },
    userselect: {
        tag: 'userSelect',
        defaultValue: 'auto',
        values: ['auto', 'none', 'text', 'contain', 'all'],
    },
    resizemode: {
        tag: 'resizeMode',
        defaultValue: 'cover',
        values: ['cover', 'contain', 'stretch', 'repeat', 'center'],
        prefix: 'Mobile',
    },
    overlaycolor: {
        tag: 'overlayColor',
        defaultValue: '',
    },
    tintcolor: {
        tag: 'tintColor',
        defaultValue: '',
    },
    objectfit: {
        tag: 'objectFit',
        defaultValue: 'cover',
        values: ['cover', 'contain', 'fill', 'scale-down'],
    },
};
