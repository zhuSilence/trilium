import NoteContextAwareWidget from "../note_context_aware_widget.js";
import server from "../../services/server.js";
import EmptyTypeWidget from "../type_widgets/empty.js";
import EditableTextTypeWidget from "../type_widgets/editable_text.js";
import ReadOnlyTextTypeWidget from "../type_widgets/read_only_text.js";
import EditableCodeTypeWidget from "../type_widgets/editable_code.js";
import ReadOnlyCodeTypeWidget from "../type_widgets/read_only_code.js";
import FileTypeWidget from "../type_widgets/file.js";
import ImageTypeWidget from "../type_widgets/image.js";
import NoneTypeWidget from "../type_widgets/none.js";
import RenderTypeWidget from "../type_widgets/render.js";
import RelationMapTypeWidget from "../type_widgets/relation_map.js";
import CanvasTypeWidget from "../type_widgets/canvas.js";
import ProtectedSessionTypeWidget from "../type_widgets/protected_session.js";
import BookTypeWidget from "../type_widgets/book.js";
import NoteMapTypeWidget from "../type_widgets/note_map.js";
import WebViewTypeWidget from "../type_widgets/web_view.js";
import DocTypeWidget from "../type_widgets/doc.js";
import ContentWidgetTypeWidget from "../type_widgets/content_widget.js";
import AttachmentDetailTypeWidget from "../type_widgets/attachment_detail.js";
import AttachmentListTypeWidget from "../type_widgets/attachment_list.js";
import extendWidgetWether from "./extend_widget_wether.js";

const TPL = `
<div class="extend-widget">
    <style>
        .extend-button {
            margin: 10px;
        }
    </style>

    <button class="btn btn-sm extend-button extend-button-insert-wether">Insert Date And Wether</button>
</div>
`;

const typeWidgetClasses = {
    'empty': EmptyTypeWidget,
    'editableText': EditableTextTypeWidget,
    'readOnlyText': ReadOnlyTextTypeWidget,
    'editableCode': EditableCodeTypeWidget,
    'readOnlyCode': ReadOnlyCodeTypeWidget,
    'file': FileTypeWidget,
    'image': ImageTypeWidget,
    'search': NoneTypeWidget,
    'render': RenderTypeWidget,
    'relationMap': RelationMapTypeWidget,
    'canvas': CanvasTypeWidget,
    'protectedSession': ProtectedSessionTypeWidget,
    'book': BookTypeWidget,
    'noteMap': NoteMapTypeWidget,
    'webView': WebViewTypeWidget,
    'doc': DocTypeWidget,
    'contentWidget': ContentWidgetTypeWidget,
    'attachmentDetail': AttachmentDetailTypeWidget,
    'attachmentList': AttachmentListTypeWidget
};
export default class ExtendWidget extends NoteContextAwareWidget {

    constructor() {
        super();
        this.typeWidgets = {};
    }

    get name() {
        return "Extend";
    }

    get toggleCommand() {
        return "toggleRibbonTabNoteInfo";
    }

    isEnabled() {
        return this.note;
    }

    getTitle() {
        return {
            show: this.isEnabled(),
            title: 'Extend',
            icon: 'bx bx-info-circle'
        };
    }

    doRender() {
        this.$widget = $(TPL);
        this.contentSized();

        this.$insertDateAndWether = this.$widget.find(".extend-button-insert-wether");
        this.$insertDateAndWether.on('click', async () => {
            const lunarDay = await extendWidgetWether.getLunarDay();
            const wether = await extendWidgetWether.getWether();
            const formattedDate = `${lunarDay} ${wether.city} ${wether.dayweather}`;
            let insertContent = "<h2 class='insert-date-and-wether'>" + formattedDate + "</h2>";

            // 获取文档中的现有内容，并且其前面插入上面的字符串，然后更新笔记内容
            let blob = await server.get(`notes/${this.noteId}/blob`, {}, this.componentId);
            let data = {
                content: insertContent + blob.content
            }
            await server.put(`notes/${this.noteId}/data`, data, this.componentId);
        });
    }

    async refreshWithNote(note) {
        if (note.type === 'text') {
            this.$insertDateAndWether.show();
        } else {
            this.$insertDateAndWether.hide();
        }
    }

    entitiesReloadedEvent({loadResults}) {
        if (loadResults.isNoteReloaded(this.noteId) || loadResults.isNoteContentReloaded(this.noteId)) {
            this.refresh();
        }
    }

}


function GetLocation(func) {


    let that = this,
        locationCookie = this.getSQCookie('sunqBlogLocation'),
        sunqBlogLocationCode = this.getSQCookie('sunqBlogLocationCode');

    // 如果用户多次访问，一周内不会重复请求定位接口
    if (locationCookie) {
        func(locationCookie, sunqBlogLocationCode);
    } else {
        axios({
            url: 'https://restapi.amap.com/v3/ip',
            method: 'post',
            params: {
                key: 'ba5f9b69f0541123a4dbe142da230b4d'
            },
        }).then(function (resp) {
            func(resp.data.city, resp.data.adcode);
            that.setSQCookie('sunqBlogLocation', resp.data.city, 3); // 相隔3小时同一浏览器再次访问时会重新定位
            that.setSQCookie('sunqBlogLocationCode', resp.data.adcode, 3);
        }).catch();
    }
};

function getWeathData(cityName, cityCode) {
    let that = this;
    axios({
        url: "https://restapi.amap.com/v3/weather/weatherInfo",
        method: "GET",
        params: {
            key: "ba5f9b69f0541123a4dbe142da230b4d",
            city: cityCode,
            extensions: 'all',
            output: "JSON"
        },
    }).then(function (resp) {
        //  此处获得天气预报数据
        console.log(resp.data);

        that.setSQCookie(
            "sunqBlogWeather",
            resp.data,
            3
        ); // 相隔3小时同一浏览器再次访问时会重新获取天气
    })
        .catch();
}
