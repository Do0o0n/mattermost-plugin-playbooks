// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';

import {mtrim} from 'js-trim-multiline-string';

import {DraftPlaybookWithChecklist, emptyPlaybook, newChecklistItem} from 'src/types/playbook';

import MattermostLogo from 'src/components/assets/mattermost_logo_svg';
import ClipboardChecklist from 'src/components/assets/illustrations/clipboard_checklist_svg';
import DumpsterFire from 'src/components/assets/illustrations/dumpster_fire_svg';
import Gears from 'src/components/assets/illustrations/gears_svg';
import Handshake from 'src/components/assets/illustrations/handshake_svg';
import Rocket from 'src/components/assets/illustrations/rocket_svg';
import SmileySunglasses from 'src/components/assets/illustrations/smiley_sunglasses_svg';
import BugSearch from 'src/components/assets/illustrations/bug_search_svg';
import LightBulb from 'src/components/assets/illustrations/light_bulb_svg';

export interface PresetTemplate {
    label?: string;
    labelColor?: string;
    title: string;
    description?: string;

    author?: ReactNode;
    icon: ReactNode;
    color?: string;
    template: DraftPlaybookWithChecklist;
}

const preprocessTemplates = (presetTemplates: PresetTemplate[]): PresetTemplate[] => (
    presetTemplates.map((pt) => ({
        ...pt,
        template: {
            ...pt.template,
            num_stages: pt.template?.checklists.length,
            num_actions:
                1 + // Channel creation is hard-coded
                (pt.template.message_on_join_enabled ? 1 : 0) +
                (pt.template.signal_any_keywords_enabled ? 1 : 0) +
                (pt.template.run_summary_template_enabled ? 1 : 0),
            checklists: pt.template?.checklists.map((checklist) => ({
                ...checklist,
                items: checklist.items?.map((item) => ({
                    ...newChecklistItem(),
                    ...item,
                })) || [],
            })),
        },
    }))
);

export const PresetTemplates: PresetTemplate[] = preprocessTemplates([
    {
        title: 'فارغ',
        icon: <ClipboardChecklist/>,
        color: '#FFBC1F14',
        description: 'ابدأ بحالة فارغة وأنشئ عملك الفني الخاص.',
        template: {
            ...emptyPlaybook(),
            title: 'فارغ',
            description: 'قم بتخصيص وصف  خطة العمل هذه لتقديم نظرة عامة عن الوقت والطريقة التي يتم بها تشغيل  خطة العمل هذه.',
        },
    },
    {
        title: 'إصدار المنتج',
        description: 'أصلح عملية الإصدار الخاصة بك من التصور إلى الإنتاج.',

        icon: <Rocket/>,
        color: '#C4313314',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'إصدار المنتج',
            description: 'قم بتخصيص  خطة العمل هذه ليعكس عملية إصدار المنتج الخاصة بك.',
            checklists: [
                {
                    title: 'إعداد الكود',
                    items: [
                        newChecklistItem('فرز والتحقق من التذاكر وPRs المعلقة للدمج'),
                        newChecklistItem('بدء تحضير سجل التغييرات، وتوثيق الميزات، والمواد التسويقية'),
                        newChecklistItem('مراجعة وتحديث تبعيات المشروع حسب الحاجة'),
                        newChecklistItem('QA يعد جداول الاختبارات للإصدار'),
                        newChecklistItem('دمج ترقية قاعدة البيانات'),
                    ],
                },
                {
                    title: 'اختبار الإصدار',
                    items: [
                        newChecklistItem('قطع إصدار مرشح (RC-1)'),
                        newChecklistItem('QA يقوم باختبارات الدخان على البناء المسبق للإصدار'),
                        newChecklistItem('QA يقوم باختبارات الحمل الآلية واختبارات الترقية على البناء المسبق للإصدار'),
                        newChecklistItem('فرز ودمج إصلاحات الأخطاء التراجعية'),
                    ],
                },
                {
                    title: 'إعداد الإصدار للإنتاج',
                    items: [
                        newChecklistItem('QA يوافق على الإصدار في النهاية'),
                        newChecklistItem('قطع البناء النهائي للإصدار ونشره'),
                        newChecklistItem('نشر سجل التغييرات، وملاحظات الترقية، وتوثيق الميزات'),
                        newChecklistItem('تأكيد تحديث المتطلبات الدنيا للسيرفر في التوثيق'),
                        newChecklistItem('تحديث روابط تنزيل الإصدار في المستندات والصفحات المرتبطة'),
                        newChecklistItem('نشر الإعلانات والتسويق'),
                    ],
                },
                {
                    title: 'بعد الإصدار',
                    items: [
                        newChecklistItem('جدولة محادثة مراجعة الإصدار'),
                        newChecklistItem('إضافة تواريخ الإصدار القادم إلى تقويم الإصدار والتواصل مع الأطراف المعنية'),
                        newChecklistItem('إعداد مقاييس الإصدار'),
                        newChecklistItem('إعداد اتصالات تحديث الأمان'),
                        newChecklistItem('أرشفة قناة الحادث وإنشاء قناجديدة للإصدار القادم'),
                    ],
                },
            ],
            create_public_playbook_run: false,
            channel_name_template: 'الإصدار (vX.Y)',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`مرحبًا وأهلًا بك!
            
                تم إنشاء هذه القناة كجزء من كتيب **إصدار المنتج** وهي المكان الذي تجري فيه المحادثات المتعلقة بهذا الإصدار. يمكنك تخصيص هذه الرسالة باستخدام ماركداون حتى يتمكن كل عضو جديد من القناة من تلقي ترحيب مع معلومات وموارد مفيدة.`,
            run_summary_template_enabled: true,
            run_summary_template:
                mtrim`**حول**
                - رقم الإصدار: قيد التحديد
                - التاريخ المستهدف: قيد التحديد
            
                **الموارد**
                - عرض مصفاة Jira: [رابط قيد التحديد](#)
                - مسودة منشور المدونة: [رابط قيد التحديد](#)`,
            reminder_message_template:
                mtrim`### التغييرات منذ آخر تحديث
                -
            
                ### PRs المعلقة
                - `,
            reminder_timer_default_seconds: 24 * 60 * 60, // 24 ساعة
            retrospective_template:
                mtrim`### بدء
                -
            
                ### إيقاف
                -
            
                ### الحفاظ
                - `,
            retrospective_reminder_interval_seconds: 0, // مرة واحدة
        },
    },
    {
        title: 'حل الحوادث',
        description: 'حل الحوادث يتطلب السرعة والدقة. قم بتدفق عملياتك للاستجابة والحل بسرعة.',
        icon: <DumpsterFire/>,
        author: <MattermostLogo/>,
        color: '#33997014',
        template: {
            ...emptyPlaybook(),
            title: 'حل الحوادث',
            description: 'قم بتخصيص  خطة العمل هذه ليعكس عملية حل الحوادث الخاصة بك.',
            checklists: [
                {
                    title: 'إعداد للفرز',
                    items: [
                        newChecklistItem('إضافة مهندس الدور على القناة'),
                        newChecklistItem('بدء مكالمة الجسر', '', '/zoom start'),
                        newChecklistItem('تحديث الوصف بالوضع الحالي'),
                        newChecklistItem('إنشاء تذكرة حادث', '', '/jira create'),
                        newChecklistItem('تعيين الخطورة في الوصف (مثل #sev-2)'),
                        newChecklistItem('(إذا #sev-1) إشعار @vip'),
                    ],
                },
                {
                    title: 'التحقيق في السبب',
                    items: [
                        newChecklistItem('إضافة الأسباب المشتبه بها هنا والتحقق إذا تم القضاء عليها'),
                    ],
                },
                {
                    title: 'الحل',
                    items: [
                        newChecklistItem('تأكيد حل المشكلة'),
                        newChecklistItem('إشعار مدراء نجاح العملاء'),
                        newChecklistItem('(إذا sev-1) إشعار فريق القيادة'),
                    ],
                },
                {
                    title: 'المراجعة',
                    items: [
                        newChecklistItem('إرسال استبيان للمشاركين'),
                        newChecklistItem('جدولة اجتماع ما بعد التحليل'),
                        newChecklistItem('حفظ الرسائل الرئيسية كإدخالات خط الزمن'),
                        newChecklistItem('نشر تقرير المراجعة'),
                    ],
                },
            ],
            create_public_playbook_run: false,
            channel_name_template: 'حادث: <name>',
            message_on_join_enabled: true,
            message_on_join:
            mtrim`مرحبًا وأهلًا بك!
    
            تم إنشاء هذه القناة كجزء من كتيب **حل الحوادث** وهي المكان الذي تجري فيه المحادثات المتعلقة بهذا الإصدار. يمكنك تخصيص هذه الرسالة باستخدام ماركداون حتى يتمكن كل عضو جديد من القناة من تلقي ترحيب مع معلومات وموارد مفيدة.`,
            run_summary_template_enabled: true,
            run_summary_template:
            mtrim`**ملخص**
    
            **تأثير العميل**
    
            **حول**
            - الخطورة: #sev-1/2/3
            - المستجيبون:
            - موعد الانتهاء المتوقع:`,
            reminder_message_template: '',
            reminder_timer_default_seconds: 60 * 60, // 1 ساعة
            retrospective_template:
            mtrim`### ملخص
            يجب أن يحتوي هذا على 2-3 جمل تعطي القارئ نظرة عامة على ما حدث، وما هو السبب، وما تم القيام به. كلما كان الملخص أقصر كلما كان أفضل حيث سيكون هذا ما سينظر إليه الفرق المستقبلية للرجوع إليه.
    
            ### ما هو التأثير؟
            يصف هذا القسم تأثير تشغيل  خطة العمل هذه كما شعر به العملاء الداخليون والخارجيون بالإضافة إلى الأطراف المعنية.
    
            ### ما هي العوامل المساهمة؟
            قد يكون  خطة العمل هذه بروتوكول تفاعلي لموقف غير مرغوب فيه. إذا كان الأمر كذلك، يشرح هذا القسم الأسباب التي تسببت في الموقف في المقام الأول. قد يكون هناك عدة أسباب جذرية - هذا يساعد الأطراف المعنية على فهم ذلك.
    
            ### ما تم القيام به؟
            يحكي هذا القسم قصة كيفية تعاون الفريق خلال الحدث لتحقيق النتيجة. سيساعد هذا الفرق المستقبلية على تعلم من هذه التجربة على ما يمكن تجربته.
    
            ### ماذا تعلمنا؟
            يجب أن يتضمن هذا القسم وجهات نظر من كل من شارك للاحتفال بالانتصارات وتحديد مجالات التحسين. على سبيل المثال: ما الذي سار بشكل جيد؟ ما الذي لم يسير بشكل جيد؟ ما الذي يجب القيام به بشكل مختلف في المرة القادمة؟
    
            ### مهام المتابعة
            يسرد هذا القسم العناصر الفعلية لتحويل التعلمات إلى تغييرات تساعد الفريق على أن يصبح أكثر مهارة مع التكرارات. يمكن أن تتضمن تعديل الكتيب، نشر المراجعة، أو تحسينات أخرى. أفضل المتابعات ستكون لها مالك واضح معين وكذلك تاريخ استحقاق.
    
            ### أبرز مراحل الخط الزمني
            هذا القسم هو سجل منتقى يفصل أهم اللحظات. يمكن أن يحتوي على اتصالات رئيسية، لقطات شاشة، أو مستندات أخرى. استخدم ميزة الخط الزمني المدمجة لمساعدتك في إعادة التتبع وإعادة تشغيل تسلسل الأحداث.`,
            retrospective_reminder_interval_seconds: 24 * 60 * 60, // 24 ساعة
            signal_any_keywords_enabled: true,
            signal_any_keywords: ['sev-1', 'sev-2', '#incident', 'هذا خطير'],
        },
    },
    {
        title: 'إدخال العميل',
        description: 'أنشئ تجربة إدخال قياسية وسلسة للعملاء الجدد لتشغيلهم بسرعة.',
        icon: <Handshake/>,
        color: '#3C507A14',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'إدخال العميل',
            description: mtrim`يتم إدخال عملاء Sofachat الجدد وفقًا لعملية مشابهة ل خطة العمل هذه.
        
            قم بتخصيص  خطة العمل هذه ليعكس عملية إدخال العميل الخاصة بك.`,
            checklists: [
                {
                    title: 'تسليم المبيعات إلى ما بعد المبيعات',
                    items: [
                        newChecklistItem('مقدمة من AE لـ CSM و CSE للجهات الرئيسية المتصلة'),
                        newChecklistItem('إنشاء مجلد حساب العميل في Drive'),
                        newChecklistItem('رسالة ترحيبية خلال 24 ساعة من الفوز بالصفقة'),
                        newChecklistItem('جدولة مكالمة افتتاحية مع العميل'),
                        newChecklistItem('إنشاء خطة الحساب (الطبقة 1 أو 2)'),
                        newChecklistItem('إرسال استبيان الاكتشاف'),
                    ],
                },
                {
                    title: 'إدخال تقني للعميل',
                    items: [
                        newChecklistItem('جدولة مكالمة اكتشاف تقني'),
                        newChecklistItem('مراجعة التذاكر الحالية في Zendesk والتحديثات'),
                        newChecklistItem('تسجيل تفاصيل تقنية العميل في Salesforce'),
                        newChecklistItem('تأكيد استلام العميل لحزمة ملخص الاكتشاف التقني'),
                        newChecklistItem('إرسال تقرير "اختبار القلم" الحالي لـ Sofachat إلى العميل'),
                        newChecklistItem('جدولة جلسة تخطيط الإضافات/التكاملات'),
                        newChecklistItem('تأكيد خطط الترحيل البيانات'),
                        newChecklistItem('توسيع Sofachat بالتكاملات'),
                        newChecklistItem('تأكيد خطط اختبار الوظائف والحمل'),
                        newChecklistItem('تأكيد تنظيم الفرق/القنوات'),
                        newChecklistItem('الاشتراك في مدونة Sofachat للإصدارات والإعلانات'),
                        newChecklistItem('تأكيد الإصدار التالي للترقية'),
                    ],
                },
                {
                    title: 'الانطلاق',
                    items: [
                        newChecklistItem('طلب حزمة Sofachat swag لفريق المشروع'),
                        newChecklistItem('تأكيد خطة التوزيع على المستخدمين النهائيين'),
                        newChecklistItem('تأكيد انطلاق العميل'),
                        newChecklistItem('إجراء مراجعة ما بعد الانطلاق'),
                    ],
                },
                {
                    title: 'مطالبات القيمة الاختيارية بعد الانطلاق',
                    items: [
                        newChecklistItem('مقدمة للكتيبات واللوحات'),
                        newChecklistItem('إعلام عن ترقية Sofachat 101'),
                        newChecklistItem('مشاركة نصائح وحيل مع تركيز DevOps'),
                        newChecklistItem('مشاركة نصائح وحيل مع تركيز الكفاءة'),
                        newChecklistItem('جدولة مراجعة الخارطة الزمنية للربع مع فريق المنتج'),
                        newChecklistItem('مراجعة مع المدراء التنفيذيين (الطبقة 1 أو 2)'),
                    ],
                },
            ],
            create_public_playbook_run: false,
            channel_name_template: 'إدخال العميل: <name>',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`مرحبًا وأهلًا بك!
        
                تم إنشاء هذه القناة كجزء من كتيب **إدخال العميل** وهي المكان الذي تجري فيه المحادثات المتعلقة بهذا العميل. يمكنك تخصيص هذه الرسالة باستخدام ماركداون حتى يتمكن كل عضو جديد من القناة من تلقي ترحيب مع معلومات وموارد مفيدة.`,
            run_summary_template_enabled: true,
            run_summary_template:
                mtrim`**حول**
                - اسم الحساب: [قيد التحديد](#)
                - فرصة Salesforce: [قيد التحديد](#)
                - نوع الطلب:
                - تاريخ الإغلاق:
        
                **الفريق**
                - ممثل المبيعات: @قيد التحديد
                - مدير نجاح العميل: @قيد التحديد`,
            retrospective_template:
                mtrim`### ما سار بشكل جيد؟
                -
        
                ### ماذا يمكن أن يسير بشكل أفضل؟
                -
        
                ### ما الذي يجب تغييره في المرة القادمة؟
                - `,
            retrospective_reminder_interval_seconds: 0, // مرة واحدة
        },
    },
    {
        title: 'إدخال الموظف',
        description: 'قم بإعداد موظفيك الجدد للنجاح من خلال مدخلات من كامل منظمتك، في عملية واحدة مستقرة.',
        icon: <SmileySunglasses/>,
        color: '#FFBC1F14',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'إدخال الموظف',
            description: mtrim`كل عضو جديد في فريق Sofachat يكمل عملية الإدخال هذه عند الانضمام إلى الشركة.
        
            قم بتخصيص  خطة العمل هذه ليعكس عملية إدخال الموظف الخاصة بك.`,
            checklists: [
                {
                    title: 'قبل اليوم الأول',
                    items: [
                        newChecklistItem('أكمل نموذج [Onboarding Systems Form في IT HelpDesk](https://helpdesk.Sofachat.com/support/home)'),
                        newChecklistItem(
                            'أكمل نموذج الإدخال قبل تاريخ بدء العضو الجديد للفريق',
                            mtrim`المديرون يلعبون دورًا كبيرًا في تحديد التوقعات الواضحة وإعداد الفريق والأطراف الداخلية المعنية لكيفية مساعدة الزملاء الجدد على الاندماج والاتصال من الناحية التنظيمية والثقافية.
                                * **أهداف الإدخال:** حدد المجالات والمشاريع التي يجب أن يركز عليها العضو الجديد للفريق في أول 90 يومًا. استخدم _نظرة عامة على الدور_ الذي أكملته عند فتح الوظيفة.
                                * **وضوح AOR:** حدد AORs المرتبطة بالموظف الجديد، وحدد أي AORs سيكون الموظف الجديد [DRI](https://handbook.Sofachat.com/company/about-mattermost/list-of-terms#dri) أو سيعمل كنسخة احتياطية DRI. حسب الحاجة، حدد انتقالات AOR مع الأطراف الداخلية قبل بدء الموظف الجديد. انظر [صفحة AOR](https://handbook.mattermost.com/operations/operations/areas-of-responsibility) قم بتضمين لوحة المقابلة ومجالات التركيز الخاصة بهم.
                                * **تعيين زميل إدخال:** يجب أن يكون زميل الإدخال أو الزملاء فردًا أو مجموعة من الأشخاص الذين يمكنهم الإجابة على الأسئلة حول الفريق والقسم وSofachat. في كثير من الطرق، قد يكون زميل الإدخال [end-boss](https://handbook.mattermost.com/company/about-mattermost/mindsets#mini-boss-end-boss) لـ AORs محددة. يجب على المديرين طلب إذن محتمل من زميل الإدخال قبل التعيين.`,
                        ),
                    ],
                },
                {
                    title: 'الأسبوع الأول',
                    items: [
                        newChecklistItem(
                            'قدم عضو فريقنا الجديد في [قناة الترحيب](https://community.mattermost.com/private-core/channels/welcome)',
                            mtrim`يُطلب من جميع الموظفين الجدد إكمال نبذة قصيرة ومشاركتها مع مديريهم. يجب على المديرين تضمين هذه النبذة في رسالة الترحيب.
        
                                    تأكد من تضمين الهاشتاج \#newcolleague عند نشر رسالتك.`,
                        ),
                        newChecklistItem(
                            'مراجعة [AORs](https://handbook.mattermost.com/operations/operations/areas-of-responsibility) للفريق',
                            'هذا هو أيضًا وقت جيد لمراجعة AOR وتوقعات الإدخال للموظف الجديد.'
                        ),
                        newChecklistItem(
                            'مراجعة قائمة الشركاء الداخليين الرئيسيين',
                            'هؤلاء هم الأشخاص الذين سيعمل معهم الموظف الجديد والذين يجب على الموظف الجديد جدولة اجتماعات معهم خلال الشهرين الأولين.',
                        ),
                        newChecklistItem(
                            'إضافة إلى قنوات Sofachat',
                            'تأكد من إضافة عضو الفريق إلى القنوات المناسبة بناءً على الفريق والدور.',
                        ),
                        newChecklistItem(
                            'مشاركة الأوتار الزمنية للفريق',
                            'مراجعة الأوتار الزمنية المحددة للفريق، والقواعد  قاعدة العملية و خطط العمل ذات الصلة.',
                        ),
                    ],
                },
                {
                    title: 'الشهر الأول',
                    items: [
                        newChecklistItem('مراجعة [V2MOMs](https://handbook.mattermost.com/company/how-to-guides-for-staff/how-to-v2mom) للشركة والفريق'),
                        newChecklistItem('تواءم على مسؤوليات الدور والتوقعات'),
                        newChecklistItem(
                            'مقدمة COM',
                            'يُدعى أعضاء الفريق الجدد لتقديم أنفسهم في [COM](https://handbook.mattermost.com/operations/operations/company-cadence#customer-obsession-meeting-aka-com) خلال الأسبوع الثاني. إذا لم يكونوا مرتاحين لإجراء مقدمتهم الخاصة، سيقوم المديرون بذلك نيابة عنهم.',
                        ),
                        newChecklistItem(
                            '[Shoulder Check](https://handbook.mattermost.com/company/about-mattermost/mindsets#shoulder-check)',
                            'تقييم النقاط العمياء المحتملة وطلب التعليقات.',
                        ),
                    ],
                },
                {
                    title: 'الشهر الثاني',
                    items: [
                        newChecklistItem(
                            'تعليقات الزميل الجديد لمدة 90 يومًا',
                            'يتم إشعار المديرين لبدء [عملية تعليقات الزميل الجديد](https://handbook.mattermost.com/contributors/onboarding#new-colleague-90-day-feedback-process) على الموظف الجديد في اليوم الـ65 من بدءه. ستتضمن التعليقات ملخصًا لمسؤوليات الموظف الجديد خلال أول 90 يومًا. يجب على المديرين تواصل هذه المسؤوليات مع الموظف الجديد خلال أسبوعهم الأول.',
                        ),
                    ],
                },
                {
                    title: 'الشهر الثالث',
                    items: [
                        newChecklistItem('تقديم تعليقات الزميل الجديد'),
                    ],
                },
            ],
            create_public_playbook_run: false,
            channel_name_template: 'إدخال الموظف: <name>',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`مرحبًا وأهلًا بك!
        
                تم إنشاء هذه القناة كجزء من كتيب **إدخال الموظف** وهي المكان الذي تجري فيه المحادثات المتعلقة بإدخال هذا الموظف. يمكنك تخصيص هذه الرسالة باستخدام ماركداون حتى يتمكن كل عضو جديد من القناة من تلقي ترحيب مع معلومات وموارد مفيدة.`,
            run_summary_template: '',
            reminder_timer_default_seconds: 7 * 24 * 60 * 60, // مرة كل أسبوع
            retrospective_template:
                mtrim`### ما سار بشكل جيد؟
                -
        
                ### ماذا يمكن أن يسير بشكل أفضل؟
                -
        
                ### ما الذي يجب تغييره في المرة القادمة؟
                - `,
            retrospective_reminder_interval_seconds: 0, // مرة واحدة
        },
    },
    {
        title: 'دورة حياة الميزة',
        description: 'أنشئ سير عمل شفاف عبر فرق التطوير لضمان أن عملية تطوير الميزة لديك سلسة.',
        icon: <Gears/>,
        color: '#62697E14',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'دورة حياة الميزة',
            description: 'قم بتخصيص  خطة العمل هذه ليعكس عملية دورة حياة الميزة الخاصة بك.',
            checklists: [
                {
                    title: 'التخطيط',
                    items: [
                        newChecklistItem('اشرح ما هي المشكلة ولماذا تعتبر مهمة'),
                        newChecklistItem('اشرح الاقتراحات لحلول محتملة'),
                        newChecklistItem('ضع قائمة بالأسئلة المفتوحة والافتراضات'),
                        newChecklistItem('حدد تاريخ الإصدار المستهدف'),
                    ],
                },
                {
                    title: 'البدء',
                    items: [
                        newChecklistItem(
                            'اختر مالك هندسي للميزة',
                            mtrim`التوقعات من المالك:
                            - مسؤول عن تحديد وتلبية التوقعات لتواريخ المستهدفة' +
                            - نشر تحديثات الحالة الأسبوعية' +
                            - تجريب الميزة في اجتماع R&D' +
                            - ضمان الجودة التقنية بعد الإصدار`,
                        ),
                        newChecklistItem('حدد ودعوة المساهمين إلى قناة الميزة'),
                        newChecklistItem(
                            'جدولة اجتماعات البدء والمتابعة المتكررة',
                            mtrim`التوقعات بعد اجتماع البدء:
                            - توافق على المشكلة الدقيقة بالإضافة إلى النطاق العام والهدف
                            - خطوات واضحة للمرحلة التالية والنتائج لكل فرد`,
                        ),
                    ],
                },
                {
                    title: 'البناء',
                    items: [
                        newChecklistItem(
                            'توافق على النطاق والجودة والوقت.',
                            'هناك على الأرجح العديد من الجهود المختلفة لتحقيق التوافق هنا، هذا المربع يمثل فقط الموافقة من المساهمين.',
                        ),
                        newChecklistItem('تفكيك مراحل الميزة وإضافتها إلى قائمة المهام هذه'),
                    ],
                },
                {
                    title: 'الشحن',
                    items: [
                        newChecklistItem('تحديث التوثيق ودليل المستخدم'),
                        newChecklistItem('دمج جميع PRs الميزة والأخطاء إلى الماجستير'),
                        newChecklistItem(
                            'تجريب للمجتمع',
                            mtrim`على سبيل المثال:
                            - اجتماع R&D
                            - اجتماع المطورين
                            - اجتماع شامل للشركة`
                        ),
                        newChecklistItem('بناء لوحة تحكم التليفون لقياس الاعتماد'),
                        newChecklistItem(
                            'إنشاء مجموعة إطلاق لفرق التسويق',
                            mtrim`بما في ذلك ولكن ليس حصرًا:
                            - منشور مدونة إصدار
                            - ورقة واحدة
                            - فيديو تجريبي`,
                        ),
                    ],
                },
                {
                    title: 'المتابعة',
                    items: [
                        newChecklistItem('جدولة اجتماع لمراجعة مقاييس الاعتماد وتعليقات المستخدم'),
                        newChecklistItem('تخطيط التحسينات والتكرار التالي'),
                    ],
                },
            ],
            create_public_playbook_run: true,
            channel_name_template: 'الميزة: <name>',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`مرحبًا وأهلًا بك!
        
                تم إنشاء هذه القناة كجزء من كتيب **دورة حياة الميزة** وهي المكان الذي تجري فيه المحادثات المتعلقة بتطوير هذه الميزة. يمكنك تخصيص هذه الرسالة باستخدام Markdown حتى يتمكن كل عضو جديد من القناة من تلقي ترحيب مع معلومات وموارد مفيدة.`,
            run_summary_template_enabled: true,
            run_summary_template:
                mtrim`**واحد لينر**
                <مثلًا: تمكين المستخدمين من تحديد قالب وصف حتى يكون متسقًا لكل تشغيل وبالتالي أسهل في القراءة.>
        
                **الإصدار المستهدف**
                - الكود الكامل: تاريخ
                - إصدار العميل: شهر
        
                **الموارد**
                - Jira Epic: <رابط>
                - نموذج UX: <رابط>
                - التصميم التقني: <رابط>
                - وثائق المستخدم: <رابط>`,
            reminder_message_template:
                mtrim`### تجريب
                <أدرج_GIF_هنا>
        
                ### التغييرات منذ الأسبوع الماضي
                -
        
                ### المخاطر
                - `,
            reminder_timer_default_seconds: 24 * 60 * 60, // 1 يوم
            retrospective_template:
                mtrim`### بدء
                -
        
                ### إيقاف
                -
        
                ### الحفاظ
                - `,
            retrospective_reminder_interval_seconds: 0, // مرة واحدة
        },
    },
    {
        title: 'Bug Bash',
        description: 'قم بتخصيص  خطة العمل هذه ليعكس عملية Bug Bash الخاصة بك.',
        icon: <BugSearch/>,
        color: '#7A560014',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'Bug Bash',
            description: mtrim`حوالي مرة أو مرتين في الشهر، يستخدم فريق Sofachat خطط عمل  خطة العمل هذه لتشغيل اختبار Bug Bash لمدة 50 دقيقة لاختبار أحدث إصدار من خطط عمل.
        
            قم بتخصيص  خطة العمل هذه ليعكس عملية Bug Bash الخاصة بك.`,
            create_public_playbook_run: true,
            channel_name_template: 'Bug Bash (vX.Y)',
            checklists: [
                {
                    title: 'إعداد بيئة الاختبار (قبل الاجتماع)',
                    items: [
                        newChecklistItem(
                            'نشر البناء المعني على community-daily',
                        ),
                        newChecklistItem(
                            'تشغيل نسخة سحابي يعمل على T0',
                            '',
                            '/cloud create playbooks-bug-bash-t0 --license te --image mattermost/mattermost-team-edition --test-data --version master',
                        ),
                        newChecklistItem(
                            'تشغيل نسخة سحابي يعمل على E0',
                            '',
                            '/cloud create playbooks-bug-bash-e0 --license te --test-data --version master',
                        ),
                        newChecklistItem(
                            'تشغيل نسخة سحابي يعمل على E10',
                            '',
                            '/cloud create playbooks-bug-bash-e10 --license e10 --test-data --version master',
                        ),
                        newChecklistItem(
                            'تشغيل نسخة سحابي يعمل على E20',
                            '',
                            '/cloud create playbooks-bug-bash-e20 --license e20 --test-data --version master',
                        ),
                        newChecklistItem(
                            'تمكين Open Servers & CRT لجميع النسخ السحابية',
                            mtrim`من سطر الأوامر، قم بتسجيل الدخول إلى كل سيرفر على التوالي عبر [\`mmctl\`](https://github.com/mattermost/mmctl)، وتكوين، على سبيل المثال:
                                \`\`\`
                                for server in playbooks-bug-bash-t0 playbooks-bug-bash-e0 playbooks-bug-bash-e10 playbooks-bug-bash-e20; do
                                    mmctl auth login https://$server.test.mattermost.cloud --name $server --username sysadmin --password-file <(echo "Sys@dmin123");
                                    mmctl config set TeamSettings.EnableOpenServer true;
                                    mmctl config set ServiceSettings.CollapsedThreads default_on;
                                done
                                \`\`\``,
                        ),
                        newChecklistItem(
                            'تثبيت البرنامج المساعد على كل نسخة',
                            mtrim`من سطر الأوامر، قم بتسجيل الدخول إلى كل سيرفر على التوالي عبر [\`mmctl\`](https://github.com/mattermost/mmctl)، وتكوين، على سبيل المثال:
                                \`\`\`
                                for server in playbooks-bug-bash-t0 playbooks-bug-bash-e0 playbooks-bug-bash-e10 playbooks-bug-bash-e20; do
                                    mmctl auth login https://$server.test.mattermost.cloud --name $server --username sysadmin --password-file <(echo "Sys@dmin123");
                                    mmctl plugin install-url --force https://github.com/mattermost/mattermost-plugin-playbooks/releases/download/v1.22.0%2Balpha.3/playbooks-1.22.0+alpha.3.tar.gz
                                done
                                \`\`\``,
                        ),
                        newChecklistItem(
                            'إعلان Bug Bash',
                            'تأكد من أن الفريق والمجتمع على علم بـ Bug Bash القادم.',
                        ),
                    ],
                },
                {
                    title: 'تحديد النطاق (10 دقائق)',
                    items: [
                        newChecklistItem(
                            'مراجعة تفاصيل الإيداع في GitHub',
                        ),
                        newChecklistItem(
                            'تحديد الميزات الجديدة لإضافتها إلى قائمة مناطق الاختبار المستهدفة',
                        ),
                        newChecklistItem(
                            'تحديد الوظائف الحالية لإضافتها إلى قائمة مناطق الاختبار المستهدفة',
                        ),
                        newChecklistItem(
                            'إضافة تباديل T0/E0/E10/E20 ذات الصلة',
                        ),
                        newChecklistItem(
                            'تعيين المالكين',
                        ),
                    ],
                },
                {
                    title: 'مناطق الاختبار المستهدفة (30 دقيقة)',
                    items: [],
                },
                {
                    title: 'الفرز (10 دقائق)',
                    items: [
                        newChecklistItem(
                            'مراجعة المشكلات لتحديد ما يجب إصلاحه للإصدار القادم',
                        ),
                        newChecklistItem(
                            'تعيين مالكين لجميع إصلاحات الأخطاء المطلوبة',
                        ),
                    ],
                },
                {
                    title: 'التنظيف',
                    items: [
                        newChecklistItem(
                            'تنظيف النسخة السحابي الذي يعمل على T0',
                            '',
                            '/cloud delete playbooks-bug-bash-t0',
                        ),
                        newChecklistItem(
                            'تنظيف النسخة السحابي الذي يعمل على E0',
                            '',
                            '/cloud delete playbooks-bug-bash-e0',
                        ),
                        newChecklistItem(
                            'تنظيف النسخة السحابي الذي يعمل على E10',
                            '',
                            '/cloud delete playbooks-bug-bash-e10',
                        ),
                        newChecklistItem(
                            'تنظيف النسخة السحابي الذي يعمل على E20',
                            '',
                            '/cloud delete playbooks-bug-bash-e20',
                        ),
                    ],
                },
            ],
            status_update_enabled: true,
            message_on_join: mtrim`مرحبًا! نحن نستخدم هذه القناة لتشغيل اختبار Bug Bash لمدة 50 دقيقة لأحدث إصدار من خطط عمل. سيتم قضاء العشر دقائق الأولى في تحديد النطاق والملكية، تليها 30 دقيقة من الاختبار المستهدف في المناطق المحددة، و 10 دقائق من الفرز.
        
            عندما تجد مشكلة، قم بنشر موضوع جديد في هذه القناة مع علامة #bug وشارك أي لقطات شاشة وخطوات إعادة الإنتاج. سيقوم مالك هذا الاختبار بفرز الرسائل إلى تذاكر حسب الحاجة.`,
            message_on_join_enabled: true,
            retrospective_enabled: false,
            run_summary_template_enabled: true,
            run_summary_template: mtrim`فريق خطط عمل ينفذ اختبار Bug Bash لتأهيل الإصدار القادم.
        
            عندما نواجه مشكلات، ببساطة ابدأ موضوع جديد وعلّمه بـ #bug (أو #feature) لتسهيل تتبع هذه.
        
            **رابط الإصدار**: قيد التحديد
            **Zoom**: قيد التحديد
            **فلتر الفرز**: https://mattermost.atlassian.net/secure/RapidBoard.jspa?rapidView=68&projectKey=MM&view=planning.nodetail&quickFilter=332&issueLimit=100
        
            | السيرفرات |
            | -- |
            | [T0](https://playbooks-bug-bash-t0.test.mattermost.cloud) |
            | [E0](https://playbooks-bug-bash-e0.test.mattermost.cloud) |
            | [E10](https://playbooks-bug-bash-e10.test.mattermost.cloud) |
            | [E20](https://playbooks-bug-bash-e20.test.mattermost.cloud) |
        
            سجل الدخول باستخدام:
        
            | اسم المستخدم | كلمة المرور |
            | -- | -- |
            | sysadmin | Sys@dmin123 |`,
        },
    },
    {
        title: 'تعلم كيفية استخدام  خطط العمل',
        label: 'موصى به للمبتدئين',
        labelColor: '#E5AA1F29-#A37200',
        icon: <LightBulb/>,
        color: '#FFBC1F14',
        author: <MattermostLogo/>,
        description: 'جديد في  خطط العمل؟ سيساعدك  خطة العمل هذه على التعرف على  خطط العمل والتكوينات وتشغيل  خطط العمل.',
        template: {
            ...emptyPlaybook(),
            title: 'تعلم كيفية استخدام  خطط العمل',
            description: mtrim`استخدم هذا  خطة العمل لمعرفة المزيد حول  خطط العمل. اذهب من خلال هذه الصفحة للتحقق من المحتويات أو ببساطة اختر 'بدء تشغيل اختبار' في الزاوية اليمنى العليا.`,
            create_public_playbook_run: true,
            channel_name_template: 'تشغيل الإدخال',
            checklists: [
                {
                    title: 'تعلم',
                    items: [
                        newChecklistItem(
                            'جرب تحرير اسم  قاعدة العمل أو الوصف في القسم العلوي من هذه الصفحة.',
                        ),
                        newChecklistItem(
                            'جرب التحقق من المهام الأولى الأولى!',
                        ),
                        newChecklistItem(
                            'قم بتعيين مهمة لنفسك أو لأحد الأعضاء الآخرين.',
                        ),
                        newChecklistItem(
                            'انشر تحديث حالتك الأول.',
                        ),
                        newChecklistItem(
                            'أكمل قائمة المهام الأولى!',
                        ),
                    ],
                },
                {
                    title: 'التعاون',
                    items: [
                        newChecklistItem(
                            'قم بدعوة أعضاء الفريق الآخرين الذين ترغب في التعاون معهم.',
                        ),
                        newChecklistItem(
                            'تخطي مهمة.',
                        ),
                        newChecklistItem(
                            'أكمل  قاعدة العمل.',
                        ),
                    ],
                },
            ],
            status_update_enabled: true,
            reminder_timer_default_seconds: 50 * 60, // 50 دقيقة
            message_on_join: '',
            message_on_join_enabled: false,
            retrospective_enabled: false,
            run_summary_template_enabled: true,
            run_summary_template: mtrim`هذه المنطقة الملخصية تساعد الجميع المشاركين على جمع السياق بسرعة. إنها تدعم بناء الجملة ماركداون تمامًا مثل رسالة قناة، فقط انقر للتحرير وجربها!
        
            - تاريخ البدء: 20 ديسمبر، 2021
            - التاريخ المستهدف: لم يحدد بعد
            - دليل المستخدم: وثائق  خطط العمل`,
        },
    },
]);

export default PresetTemplates;
