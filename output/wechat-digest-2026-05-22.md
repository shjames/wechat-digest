# 公众号日报 · 2026-05-22

> 共 20 个账号，30 篇文章

---

## 数字生命卡兹克

### [分享一个很实用的寓言故事prompt，5分钟帮你理解任何新概念。（10:09）](https://weread.qq.com/web/mp/reader/MP_WXS_3223096120_L1ISA0FvxY~7OR994RttWw)

作者分享了一个源自 Anthropic Claude 对齐团队负责人 Amanda Askell 的学习方法：用 AI 讲寓言故事来理解新概念。核心思路是让 AI 围绕指定概念创作一则不直接点破概念名称的寓言，由故事本身承载全部意义，最后才隐约揭示主题，令读者产生"原来讲的是这个"的顿悟感。作者在此基础上优化了提示词，增加了防套路约束（禁用钟、河流、灯塔等常见意象和结构），并要求 AI 在结尾提出两道检验问题——一道测试对概念核心的理解，一道测试跨领域迁移能力。这种"学中作"的叙事手法与刘慈欣《三体》中云天明讲童话的方式有异曲同工之妙，被作者称为目前见过最有效的概念学习方式。

> 📎 [原文链接](https://mp.weixin.qq.com/s/L1ISA0FvxY~7OR994RttWw)

---

## 夕小瑶科技说

### [AI音乐下半场：Mureka跨过生产可用门槛，让模型像作曲家一样思考，开发者又可以有哪些新可能？（11:25）](https://weread.qq.com/web/mp/reader/MP_WXS_3207765945_KDx7obhfHmG4wbirIUkiYw)

AI 音乐 B 端市场长期依赖灰产中转，因为 Suno、Udio 等头部产品从未开放官方 API。Mureka 的 MusiCoT 框架改变了这一局面——通过在生成音乐前先进行宏观结构规划（类似文本领域的思维链），而非逐音符猜测，使模型具备了类似人类作曲家的全局视野。V9 版本在段落级文本控制、混音音质、人声表达、生成效率和多样性五方面同步提升，达到"生成即可发布"的商业标准。多家 B 端企业切换到 Mureka 后，业务量实现翻倍乃至六倍增长。作者还实测了 Remix 功能和 Studio 多轨编辑模式，认为 Mureka 已真正从"生成工具"进化为"制作音乐"的专业平台。

> 📎 [原文链接](https://mp.weixin.qq.com/s/KDx7obhfHmG4wbirIUkiYw)

---

## AI零距离

### [Hermes彻底碾压OpenClaw，成为打工人首选AI搭子（16:10）](https://weread.qq.com/web/mp/reader/MP_WXS_3246637693_syz~votENjYl9yIn0nGsHQ)

Hermes 在上线仅 10 周后登顶 OpenRouter 全球日 Token 消耗榜首，超越 OpenClaw。其崛起的核心在于架构上对 OpenClaw 痛点的针对性回应：自我进化技能机制（积累 20 个自创技能后任务速度提升 40%）、持久记忆层（解决 OpenClaw 每次"失忆"问题）、模型解耦（支持所有主流开源模型）以及本地优先的低攻击面设计。相比之下，OpenClaw 存在严重安全漏洞（512 个漏洞含 8 个严重级别）、Token 消耗失控及供应链风险等问题，Gartner 已将其列为"不可接受的企业网络安全风险"。文章建议从未使用过 OpenClaw 的用户可直接上手 Hermes，已有大量积累的团队则需评估迁移成本。

> 📎 [原文链接](https://mp.weixin.qq.com/s/syz~votENjYl9yIn0nGsHQ)

### [来讨论下：HTML 一定比 Markdown 好？（16:10）](https://weread.qq.com/web/mp/reader/MP_WXS_3246637693_TFId-f4SnFZnyM1H9Yhmfw)

Anthropic 工程师 Thariq Shihipar 发文主张 AI Agent 时代应以 HTML 取代 Markdown 作为默认输出格式，并获 Karpathy 点赞转发。核心论据是：HTML 支持表格、SVG、交互控件、空间布局等 Markdown 无法实现的表达，适合方案对比、代码审查、报告汇报等场景，且分享更便捷。Karpathy 补充了视觉认知视角，认为人脑三分之一算力处理视觉信息，AI 输出应优先采用可视化格式。但作者也指出 HTML 并非万能：维护成本高、Git diff 可读性差、工具链断裂，在 Agent 中间产物和需要手动编辑的场景中 Markdown 仍不可替代，最终应按具体场景选择。

> 📎 [原文链接](https://mp.weixin.qq.com/s/TFId-f4SnFZnyM1H9Yhmfw)

---

## 量子位

### [龙虾养不动了？周鸿祎反手给虾搭了个云端办公室，专业私教在线炼虾（16:45）](https://weread.qq.com/web/mp/reader/MP_WXS_3236757533_ZmldQn-Q6ViUD705Plolug)

Agent 框架热度退潮后，360 针对"太难、太贵、还不安全"三大痛点推出安全龙虾云端版与龙虾教练。云端版为用户提供云主机、云盘、云浏览器一体化环境，下完指令即可关机，Agent 在后台持续运行；龙虾教练则通过对话式交互，两分钟内生成包含 soul、上下文、工具、记忆、技能的完整 Agent 架构并直接部署，且能主动扩展能力和迭代写作策略。文章认为当前 Agent 的卡点已从模型能力转向基础设施与可落地性，Foundation Capital 的研究也指出真正护城河在于执行过程中沉淀的决策经验，而非框架本身。

> 📎 [原文链接](https://mp.weixin.qq.com/s/ZmldQn-Q6ViUD705Plolug)

### [LeCun 10亿押注的方向，全球领先视觉大模型团队早已布局（16:45）](https://weread.qq.com/web/mp/reader/MP_WXS_3236757533_yG46t3pyCAPjd6xcFoOKig)

视启未来（Grounding DINO 与 DINO-X 团队）正在研发隐空间世界模型——与 LeCun 创办 AMI Labs 所押注的技术路线高度一致。其核心主张是：现有世界模型在像素空间学习，易被纹理、光照等细节干扰，难以习得真正的物理因果规律；而在以物体为中心的隐空间中建模，能更高效地过滤冗余信息，学习物体间的交互因果关系。视启提出"视觉原生世界模型"三项特征：Object-Centric（物体中心表征）、Action-Aligned（跨本体动作对齐）、Causality-Driven（因果驱动）。其 DINO 系列已被 Meta SAM2/SAM3、阿里 Qwen、字节 Seed 等广泛引用，在开放物体理解榜单上保持长期领先。

> 📎 [原文链接](https://mp.weixin.qq.com/s/yG46t3pyCAPjd6xcFoOKig)

### [量子位编辑作者招聘（16:45）](https://weread.qq.com/web/mp/reader/MP_WXS_3236757533_Y4C525saluKdj-~CNQAchA)

（招募广告）量子位面向社招与校招开放 AI 产业、AI 财经商业、AI 产品三大方向编辑/主笔/主编岗位，工作地点北京中关村。

> 📎 [原文链接](https://mp.weixin.qq.com/s/Y4C525saluKdj-~CNQAchA)

---

## 武志红

### [阿嬷票房破7亿，我看到了焦虑时代的解药（12:35）](https://weread.qq.com/web/mp/reader/MP_WXS_3568298336_XC4ai0GXzd3JrO9b~8QzzQ)

电影《给阿嬷的情书》以极低成本和素人演员逆袭至 7 亿票房、豆瓣 9.1 分，作者认为其核心在于对"众生感"（Sonder）的唤醒——观众透过潮汕华人"侨批"书信往来，感受到每个普通人都有其完整的情感世界。南枝代替亡夫木生向其妻淑柔写了 18 年信的故事，并非鸡汤式励志，而是在利益算计盛行的今天展示了一种朴素的道义选择。影片用喜剧节奏承载悲情，令人"哀而不伤"。文章指出影片爆火折射出现代人对人与人之间真诚连接的深切渴望，萍水相逢的善意足以消解焦虑时代弥漫的孤独与隔阂。

> 📎 [原文链接](https://mp.weixin.qq.com/s/XC4ai0GXzd3JrO9b~8QzzQ)

### [能一眼看透人心，是很稀缺的本事！千万别忽视（12:35）](https://weread.qq.com/web/mp/reader/MP_WXS_3568298336_ntu-Qgchd83BiX54PtHwqA)

（广告）文章以荣格"受伤的疗愈者"概念为引，主张高敏感人群的情绪感知能力是心理咨询工作的宝贵资源，但未经专业训练的共情会导致无边界吸收负能量、陷入内耗。文章为"武志红领衔·心理咨询师预备班"做课程推广，售价 29.9 元，5 月 28 日开学。

> 📎 [原文链接](https://mp.weixin.qq.com/s/ntu-Qgchd83BiX54PtHwqA)

### [当你开始爱自己，全世界都会来爱你 | 武志红直播预约（12:35）](https://weread.qq.com/web/mp/reader/MP_WXS_3568298336_ndj8HSC-XJ3HAfE~vCgh0w)

（广告）武志红 525 心理节直播预告，含"散掉的自己如何凝聚""中年停滞如何突破""如何重建真我"三场主题直播，5 月 25 日举行，无回放。

> 📎 [原文链接](https://mp.weixin.qq.com/s/ndj8HSC-XJ3HAfE~vCgh0w)

### [你敢面对真实的自己吗？1分钟解锁你的深层欲望（12:35）](https://weread.qq.com/web/mp/reader/MP_WXS_3568298336_qBX58GG5-Oox~ozzX6x~fQ)

（广告）文章通过一则购物成瘾案例说明"表层欲望"与"深层欲望"的区别——当事人疯狂购物的背后是对"被爱"的深层渴望。文章为"武志红心理·欲望金字塔测试"做免费测评推广。

> 📎 [原文链接](https://mp.weixin.qq.com/s/qBX58GG5-Oox~ozzX6x~fQ)

---

## 三联生活周刊

### [豆瓣8.9，这个顶流男神的宝藏综艺何以治愈无数人？（21:02）](https://weread.qq.com/web/mp/reader/MP_WXS_1791575621_HkqoGHWN5hRJFRTVm5710w)

韩国综艺《乡村魔发师》凭借明星朴宝剑在消亡危险村庄开设理发店的设定，以"善良综艺"之名拿下 IMDb 9.7 高分和豆瓣 8.9 分。文章分析其成功要素：嘉宾提前考取专业资格证、真心投入而非走过场；将叙事重心从明星转向村民，92 岁独居老奶奶学英语、86 岁老人拍遗照等真实故事形成远比明星更有共鸣的内容；同时肩负让年轻人重返乡村的公益使命。这是对"何谓经营类综艺中的'真'"这一命题的有力回答——有限定时光里投入的真心，在模拟经营的"假"框架中催生了最纯粹的人情联结。

> 📎 [原文链接](https://mp.weixin.qq.com/s/HkqoGHWN5hRJFRTVm5710w)

### [就算你是"世界杯"球迷，也不耽误找件球衣"凹造型"（21:02）](https://weread.qq.com/web/mp/reader/MP_WXS_1791575621_cNApDlHmAY3SHjIQOog8ow)

2026 美加墨世界杯催生了中国年轻人的球衣穿搭热潮，但驱动力已从球队归属感转向审美表达。文章梳理了多支球队球衣背后的文化故事——法国客场致敬自由女神像的氧化铜色、哥伦比亚太平洋与加勒比海双蓝交织、牙买加拉斯塔法里文化配色、韩国"无穷花"太空紫——球衣正成为跨文化审美符号。中国队缺席世界杯反而给年轻人带来了审美自由：无需承担支持国队的义务，可以纯粹以个人审美选择球衣。预计2026年国内复古足球消费市场规模将突破 50 亿元，18-35 岁年轻群体占 72%。

> 📎 [原文链接](https://mp.weixin.qq.com/s/cNApDlHmAY3SHjIQOog8ow)

### [当身体慢下来，谁来守护生命的尊严？（18:01）](https://weread.qq.com/web/mp/reader/MP_WXS_1791575621_5umkHXTEDqLUIfxRCstVaQ)

文章通过"溢彩康养人"公益计划挖掘出两位养老护理从业者的故事，呈现养老照护升级的实践路径。广西社工陆林锋放弃深圳机会返乡，历时八年将社工服务从单点试点扩展至全县 19 个镇，累计服务老人超 10 万人次；泰康之家护理员衣美静则以"尊严修补师"的精细工作方式——喂饭前擦衣维护体面、安抚失智老人前先散步建立信任、默默整理囤积物而非强行清理——践行"不是我来管你，而是我来帮你"的新型照护理念。文章揭示：在长寿时代，养老从业者的职业价值已不只是维持生命体征，更在于维护每个人最后岁月里作为"人"的尊严与自主权。

> 📎 [原文链接](https://mp.weixin.qq.com/s/5umkHXTEDqLUIfxRCstVaQ)

### [资讯｜融资750亿美元，人类史上最大规模IPO来了？（18:01）](https://weread.qq.com/web/mp/reader/MP_WXS_1791575621_DvmKWRO5fDz~HYzalGf6Fg)

三联每周科技财经资讯速览：中国电信推出 Token 套餐（9.9 元/月含 1000 万 Token）；国产 AI 视频 Seedance 占据市场超八成份额；4 月社消零售同比增长仅 0.2%，内需放缓；美国 30 年期国债收益率升至 2007 年以来最高；印度卢比创历史新低；武汉"光谷七星"借 AI 算力热度全线上涨；长鑫科技与长江存储相继启动 A 股上市；SpaceX 向 SEC 提交 IPO 招股书，估值或达 1.75 万亿至 2 万亿美元，融资 750 亿美元有望创史上最大规模 IPO，其中 Anthropic 将每年向 SpaceX 支付 150 亿美元购买算力。

> 📎 [原文链接](https://mp.weixin.qq.com/s/DvmKWRO5fDz~HYzalGf6Fg)

### [把电影变"轻"，这届戛纳 Pocket 4P 给出了答案（12:25）](https://weread.qq.com/web/mp/reader/MP_WXS_1791575621_LUUTau-4bRgbo6YHM4ooSA)

大疆在戛纳举办 Osmo Pocket 4P 品鉴活动，邀请《索尔之子》摄影指导 Mátyás Erdély 等一流电影摄影师出席。文章梳理了电影摄影机百年减重史——从新浪潮到 DV 革命，每次器材小型化都催生了新的电影语言。Pocket 4P 的核心突破在于将 17 级动态范围与 D-Log 2 色彩模式压缩进口袋尺寸，使后期调色有了真正"塑造画面"而非"救画面"的空间，接近电影级 Log 工作流，足以在复杂多机位项目中担当不止是备用机的角色，令轻量设备第一次真正进入专业影视生产流程。

> 📎 [原文链接](https://mp.weixin.qq.com/s/LUUTau-4bRgbo6YHM4ooSA)

### [为何留学生们后来都不爱发朋友圈了？（12:25）](https://weread.qq.com/web/mp/reader/MP_WXS_1791575621_hWH3AupygnbaUI1VBZ2DfA)

文章通过三位留学生的经历探讨海外华人与国内社交圈渐行渐远的心理机制：新鲜感消退后，分享行为所需的"即时反馈"奖励无法被跨时区、跨文化的朋友圈触发；朋友圈受众关系混杂，一条动态在不同人眼中会产生截然不同的解读，让表达变得需要小心翼翼；而留学生活本身已把大量精力用于消化内心的起伏，没有余力再诉诸外部确认。文章指出，从依赖外界反馈到向内自我确认，正是一种向内稳固的成熟表现，许多人也悄悄把日常迁移到 Instagram 等海外平台上，在能理解自己的圈子里重新找到共鸣。

> 📎 [原文链接](https://mp.weixin.qq.com/s/hWH3AupygnbaUI1VBZ2DfA)

### [我们都是"被盗窃过"的幸存者（12:25）](https://weread.qq.com/web/mp/reader/MP_WXS_1791575621_wWru2Q1WxiUmNmKs2Lo8dA)

诺贝尔文学奖得主古尔纳 2025 年新作《盗窃》以 20 世纪 90 年代桑给巴尔为背景，通过三位青年的成长故事探讨"被盗窃"的多重含义：白达尔被盗走的是身份与归属感，卡里姆被盗走的是情感安全感，福齐亚被盗走的是婚姻的信任与承诺。在个人叙事之外，古尔纳将矛头指向殖民主义与革命的历史性掠夺。文章认为古尔纳的回答是：承认失去，但不被失去定义；在忍耐中等待善良的降临，并在力所能及时成为别人的善良。全书以"正是善良让我们成为人"作为底色，是送给所有"被盗窃过的幸存者"的精神礼物。

> 📎 [原文链接](https://mp.weixin.qq.com/s/wWru2Q1WxiUmNmKs2Lo8dA)

---

## 孤独大脑

### [这一点，是 AI 时代最强的"人类超能力"（21:12）](https://weread.qq.com/web/mp/reader/MP_WXS_2398022876_d9E51OH91frl7Tq~4DuykQ)

奥尔特曼曾指出，AI 时代真正需要的生存技能不再是编程，而是高度自主性（High Agency）、软技能和创意生成能力。High Agency 的核心是强烈相信自己能影响结果并主动采取行动，具体表现为内部控制点、主动性与资源性、不等待许可以及面对挫折的韧性。AI 擅长执行具体任务，但不擅长定义"做什么"和"为什么做"，High Agency 的人能将 AI 作为放大器——让 AI 高效执行，自己专注于高阶决策、创意和人际协调。培养路径包括从小事练习"偏向行动"、养成"找到办法"的习惯、在高不确定性环境中接受起伏，以及定期审视自己是"在等待"还是"在推动"。

> 📎 [原文链接](https://mp.weixin.qq.com/s/d9E51OH91frl7Tq~4DuykQ)

---

## 槽边往事

### [免于流量焦虑方法一种（12:22）](https://weread.qq.com/web/mp/reader/MP_WXS_2392038560_HBUTEEcEyEPExsyyYyR4uQ)

作者以一年前发布的腰椎间盘突出治疗方法文章为例，说明一种免于流量焦虑的写作心法：将出发点从"能否爆款"切换为"能否帮助到有需要的人"。当发布时就知道阅读量不会高，24 小时后数字不再增长的焦虑便自然消失；而基于帮助他人出发点写出的文章，会拥有超越 24 小时法定生命周期的自我传播力——真正受益的读者会帮它持续流转。作者建议每月抽出一天作为"功德日"，写一篇不以爆款为目标的文章，把一时的"失败"当作体验，以此扩展对成败的理解边界，看到更大更深的数据流动图景。

> 📎 [原文链接](https://mp.weixin.qq.com/s/HBUTEEcEyEPExsyyYyR4uQ)

---

## 香帅的金融江湖

（今日无更新）

---

## 硅星人Pro

### [硅星人 Eval Eps.1 | 8 家通用 Agent 预测 Google I/O keynote，结果出人意料（09:43）](https://weread.qq.com/web/mp/reader/MP_WXS_3926568365_tlWoU~YeXJPKHYFIuwoIRg)

硅星人 AI 前沿团队在 Google I/O 2026 前一周，向 8 家主流 Deep Research/Agent 产品发送同一份 Prompt，要求各自预测 keynote 内容，并在开奖后按"过程 40% + 结果 60%"评分细则逐条核对。最终 Claude 综合排名第一（命中数最多、编造为零），过程分最高的 Genspark 屈居第二；仅有综合分倒数第二的 GLM 押中了真正的"意外"发布——Gemini Spark；押得越多分母越大、命中率越低，Kimi 押 69 条垫底，MiniMax 只押 25 条反而排第 4。研究发现，鼓励"押得少但押得准"比鼓励大量押注更符合真实决策场景的需求，测试 Prompt 和评分细则已在 GitHub 开源。

> 📎 [原文链接](https://mp.weixin.qq.com/s/tlWoU~YeXJPKHYFIuwoIRg)

### [硅谷活动 丨Google I/O 期间，聊聊AI startup的账到底怎么算（09:43）](https://weread.qq.com/web/mp/reader/MP_WXS_3926568365_ZB1cpT3DbCDLKu~8gLtyHQ)

（活动通知）硅星人与 WebEye 在 Google I/O 期间于 Menlo Park 联合举办线下活动，主题为"AI 的账到底怎么算"，面向约 50 位 AI 创始人、Builder 和投资人，探讨 AI 软件公司成本结构与商业模式可行性。

> 📎 [原文链接](https://mp.weixin.qq.com/s/ZB1cpT3DbCDLKu~8gLtyHQ)

### [SpaceX公布招股书，最大金主居然是死敌Anthropic（09:43）](https://weread.qq.com/web/mp/reader/MP_WXS_3926568365_qXr8dR2PHrrPlae2foL~7w)

SpaceX 提交 S-1 招股书，首次将业务拆分为航天、通信（星链）、AI（xAI+X）三大板块。星链是唯一盈利板块，2025 年营收 113.87 亿美元，利润率高达 63%；AI 板块因 xAI 烧钱亏损 63.6 亿美元。最惊人的披露是：Anthropic（xAI 的直接竞争对手）与 SpaceX 签订云服务协议，每月向 SpaceX 支付 12.5 亿美元使用 Colossus 算力，36 个月总额达 450 亿美元，使其成为 SpaceX 最大金主。马斯克在上市后仍将持有约 79% 投票权，IPO 募资用途首位为"AI 计算基础设施扩展"。估值或达 2 万亿美元，融资 750 亿美元有望成为人类史上最大规模 IPO。

> 📎 [原文链接](https://mp.weixin.qq.com/s/qXr8dR2PHrrPlae2foL~7w)

---

## 前端早读课

### [【第3703期】VAPD AgentKit：可组合 Agent 前端通用库实践（09:01）](https://weread.qq.com/web/mp/reader/MP_WXS_2391052011_6G0-Od8Y5Wt3fYOOwoOpNw)

vivo 团队推出 VAPD AgentKit，以"统一消息模型 + Runtime Adapter + 前端编排"三段式架构，解决笔记、知识库、项目管理三类业务场景重复建设问题。核心设计原则是"消息即协议"（UI 只消费标准消息，不关心来源）与"运行时可插拔"（SSE、GraphQL、WebSocket 等任意后端流均可通过 Adapter 标准化）。通过 useAgentChat 和 useAgentAction 两个核心 Hook 管理多轮对话、工具调用与 Agent 循环，预留 threadId/runId 为历史回放与检查点能力扩展接口。该设计让工具调用与 Agent 循环回合在前端可编排，而非绑定特定后端协议，具备较强的通用性与扩展性。

> 📎 [原文链接](https://mp.weixin.qq.com/s/6G0-Od8Y5Wt3fYOOwoOpNw)

---

## 罗辑思维

### [33%的老人，真的在"逆生长"？（06:31）](https://weread.qq.com/web/mp/reader/MP_WXS_2396019580_DzRuwqrXMjFfIxsmxuHujA)

耶鲁大学 2026 年 3 月发布的一项追踪研究颠覆了"变老必然越来越弱"的常识：对 11000 名 65 岁以上老人进行 12 年纵向追踪，发现 45% 的人在认知和体能上出现了真实可测量的改善。更关键的发现是，对衰老持积极信念的人，改善概率显著高于持消极信念者——耶鲁教授莱维的研究证明积极年龄观可多活 7.5 年，甚至能将 APOE4 高风险基因携带者的痴呆风险降低 49.8%。机制在于积极信念通过降低压力激素、减少慢性炎症等生理路径影响健康，而非单纯心理暗示。此外，人际关系、多样化运动、目的感也都是可主动投资的晚年健康资产。

> 📎 [原文链接](https://mp.weixin.qq.com/s/DzRuwqrXMjFfIxsmxuHujA)

### ["给面子"这件事，为什么能影响很多人的人际关系？（06:31）](https://weread.qq.com/web/mp/reader/MP_WXS_2396019580_pKqkTeahsP9S~85D5eeQ1g)

清华社会学副教授严飞梳理了翟学伟关于"脸"与"面子"的学术辨析：脸是个体主动展示的自我形象，面子是他人赋予的心理地位，两者的分化源于中国熟人社会重人情、差序格局和人情往来形式化三重机制。翟学伟的"偏正结构"模型进一步解释了职场中"不敢指出正位错误"的深层逻辑：即便偏位正确、正位出错，直接挑战正位意味着对抗整个面子运作规则，代价极高。在面子化社会中生存的实用建议包括：在公开场合先铺垫肯定再给建议、借助私下渠道或第三方传递意见，以克制表达换取更大的回旋余地。

> 📎 [原文链接](https://mp.weixin.qq.com/s/pKqkTeahsP9S~85D5eeQ1g)

---

## 华洛AI转型纪实

（今日无更新）

---

## 笔记侠

### [央视专访俞浩：要么不做，要么世界第一（20:00）](https://weread.qq.com/web/mp/reader/MP_WXS_3215037546_5vQ898iWXyu-SwjvOpUKEg)

追觅科技创始人俞浩在央视《聊企来》专访中，讲述了从清华航空专业到 2017 年找到高速马达切入口的创业历程——此前历经四年接近抑郁症、试过 100 个方案。其核心方法论"N+1"是做比世界最好还要更好的产品，卖比对手更贵的价格：凭借航空背景，仅用两年就将马达从 2 万转做到 10 万转，再以领先一代的智能属性进入德国市场，拿下近 50% 扫地机份额并定价高于竞品最贵款的一倍。俞浩强调这种策略的前提是真正在核心技术上建立壁垒，当你真找到那个点时，"好像忽然你过去所有的经历都在为这一刻做准备"。

> 📎 [原文链接](https://mp.weixin.qq.com/s/5vQ898iWXyu-SwjvOpUKEg)

### [一家味精厂，卡了全球AI的脖子（20:00）](https://weread.qq.com/web/mp/reader/MP_WXS_3215037546_q4uBuraxhtHtCSkDcWVYLQ)

味之素凭借将味精生产副产物开发为 ABF 芯片封装膜，垄断全球 95% 市场，令英伟达、英特尔的顶级芯片依赖其供应。这背后是味之素从 1908 年发明味精以来在氨基酸化学领域百年深耕、数百项专利积累的结果——典型的"一米宽、千米深"护城河。相比之下，1997 年一度成为全球最大味精企业的莲花味精，因沉浸于规模优势、盲目多元化而错失基础技术研发，与 ABF 膜赛道整整差了 30 年，如今才试图通过收购切入。文章以此为鉴，指出中国制造业真正的缺口不在宽度而在深度，拥有核心技术的帝国方能抵御市场谣言与竞争冲击。

> 📎 [原文链接](https://mp.weixin.qq.com/s/q4uBuraxhtHtCSkDcWVYLQ)

---

## 魔术师卡颂

### [取代前端岗，又一新兴岗位在崛起！这才是前端人未来5年最好的就业方向！（14:00）](https://weread.qq.com/web/mp/reader/MP_WXS_3932215720_1QaJusAs6CURV7u8SNCi6Q)

（招募广告）文章以 AI 焦虑为背景，推广"AI大模型就业实战营"付费课程，主张掌握大模型能力的前端开发者薪资涨幅超 50%，课程内容涵盖 RAG、Fine-tuning、Agent、Function Call 等技术原理与企业级实战项目，2 天直播，限 100 人，免费报名。

> 📎 [原文链接](https://mp.weixin.qq.com/s/1QaJusAs6CURV7u8SNCi6Q)

---

## 傅盛

（今日无更新）

---

## 阮一峰的网络日志

### [科技爱好者周刊#397：财富正在向 AI 集中（08:13）](https://weread.qq.com/web/mp/reader/MP_WXS_3286016687_9CO5NihxhTsWaxzZaY8rpA)

本期周刊以"财富正在向 AI 集中"为主题，观察到内存、存储、服务器、光通信等 AI 相关股票的大幅上涨及全社会财富重新分配趋势，并指出处于非 AI 行业的人可能不仅吃不到红利，还会面临成本上升和投资减少的双重冲击。另有一则重要提示：实测四个大模型对食物碳水含量的估算误差极大，Gemini 2.5 Pro 对同一张图片的估计值从 55 克到 484 克不等，不可用于糖尿病等需精确计量的医疗场景。工具栏推荐了 ePub 转有声书工具 Abogen、FFmpeg 可视化工具、开源股票行情 SDK 等实用项目，还介绍了微软淘汰短信验证码转向 Passkey 的安全升级动向。

> 📎 [原文链接](https://mp.weixin.qq.com/s/9CO5NihxhTsWaxzZaY8rpA)

---

## 欧巴聊AI

### [微信读书Skill到底有多少花活?（07:29）](https://weread.qq.com/web/mp/reader/MP_WXS_3635286508_MDmY-TQtHBVurJ9VKSeBLg)

微信读书上线了官方 MCP Skill，允许 AI Agent 直接读取用户的真实阅读数据——包括进度、时长、划线笔记和书架收藏。作者认为这标志着 AI 个性化服务从依赖用户主动描述转向接入客观行为数据，真正实现"AI 越来越懂你"。文章整理了 8 个有趣玩法，包括：依据阅读时长推荐反向认知压力测试书单、跨领域提炼底层共同逻辑框架、按精力管理分类书单，乃至推演五年后可能固化的知识盲区。接入步骤极简：复制安装指令发给 Agent，设置 API Key 即可。作者最后展望：当健康、消费、通讯等更多数据也封装为 Skill 时，AI 才能真正激发出全部智能，做到 "月之暗面" 般的全面感知。

> 📎 [原文链接](https://mp.weixin.qq.com/s/MDmY-TQtHBVurJ9VKSeBLg)

---

## 冴羽

### [拆解中转站是如何赚大钱后，我决定…（17:12）](https://weread.qq.com/web/mp/reader/MP_WXS_3240792917_v3HX84-joj9u0m1-ABMMQw)

文章深度拆解 AI 模型中转站的商业结构，从生产端（源头腐败、代理商套利、逆向号池）、供货端与合规性到消费端逐一分析。生产端的核心是利用代理商/服务商层的信息不对称、区域价格差和企业折扣进行套利；号池模式则通过工业化管理订阅账号将"人用"产能改造为"机器用"产能，但生命周期极短。作者在合规建议上主张"顺势而为"而非对抗，强调立场正确（助力国内 AI 生态）和利益分配（与地方政府及生态方共享）才是长期存活的关键。消费侧建议：能通过 AI 产生实际商业价值的企业和开发者适合使用，普通个人用户直接用官方渠道即可。

> 📎 [原文链接](https://mp.weixin.qq.com/s/v3HX84-joj9u0m1-ABMMQw)

---

## 三元同学

（今日无更新）

---

## 若川视野

### [杀死那个写代码的人（21:52）](https://weread.qq.com/web/mp/reader/MP_WXS_3092403427_2A3xsFWj2KNMs~zxBIc2pA)

一位资深前端开发者用"仪式感"记录了手写代码时代的终结。文章描述了 AI 编码能力质变的几个亲历瞬间：AI 将闭源跨端框架页面还原为 H5 且还原度极高；龙虾将 20 万字内部文档直接打包成 epub；自然语言加一句话修改 Skill 就能被 AI 精确执行。面对这一变化，作者指出开发者的价值重心已从"写代码"转向"清晰描述需求"——结构化的需求表达、预判边界条件、技术方案取舍和跨部门沟通正在成为新核心能力。更深层的变化是，代码正从"需要理解的对象"变成"只要结果正确即可接受的黑盒"，工程化与研发工作流建设才是当下 AI 编码浪潮下真正的竞争壁垒。

> 📎 [原文链接](https://mp.weixin.qq.com/s/2A3xsFWj2KNMs~zxBIc2pA)

---

## 前端从进阶到入院

### [2026，这些 JavaScript API 已经废弃！（08:00）](https://weread.qq.com/web/mp/reader/MP_WXS_3275394838_GpfLdXAT~WXs3Hxwplvkrw)

文章系统梳理了 2026 年已废弃或不推荐使用的 JavaScript API，涵盖三大类别：字符串操作类（`substr()`、`trimLeft/Right()`、`escape/unescape()`），日期时间类（`getYear()`、`toLocaleFormat()`），以及 DOM 与 Web API 类（`document.execCommand()`、同步 XMLHttpRequest、`event.srcElement`、`attachEvent()`）。每项均给出废弃原因（语义不一致、IE 专属、安全风险、性能问题等）和现代替代方案，是前端开发者规范代码的实用速查参考。

> 📎 [原文链接](https://mp.weixin.qq.com/s/GpfLdXAT~WXs3Hxwplvkrw)

---

## 高级前端进阶

### [半年没碰 Codex，最近我又用回去了（09:10）](https://weread.qq.com/web/mp/reader/MP_WXS_3087840397_-hhRfmpFkm7dV4nRnMnkgQ)

作者因 Claude Code 频繁"自作主张"修改无关代码的问题，重新启用 Codex。文章对比了两者的核心差异：Codex 严格按指令操作，不越界，适合"修一个具体 bug"场景；Claude Code 自由度更高，周边工具更完善（worktree、subagent），适合复杂工程化任务。对于 Codex 的最佳配置，文章参考了一份实测报告，推荐始终开启 fast mode 并搭配高推理档位、接入 Playwright MCP 让 AI 自验工作成果、以及 YOLO 模式放手执行。还指出一个关键差异：OpenAI 允许用 Codex 订阅跑 Agent bot，而 Anthropic 不允许 Claude Code 订阅做同样的事，对长期自动化任务影响显著。

> 📎 [原文链接](https://mp.weixin.qq.com/s/-hhRfmpFkm7dV4nRnMnkgQ)

---

## 快刀青衣

### [拿到一堆 skill，真能学会怎么干吗？（18:37）](https://weread.qq.com/web/mp/reader/MP_WXS_2396422154_u2T8rpxEcUROqgjR-mPCAQ)

作者以朗格制表家族的历史故事作比喻：苏联战后将朗格所有图纸、工序文档悉数搬走，造出的手表却只有"影子"，最终还是要把学徒送回格拉苏蒂培训。这与当下"分发 AI Skill"的逻辑高度相似——能写下来的显性知识只占 10%，剩下 90% 是"直觉、经验、判断力"等无法言说的隐性知识。作者的结论并非因此否定分享，而是指出 Skill 分享构建的是"数字学徒制"——AI 是永远在线的学徒，承接那 10% 的显性流程，让人从执行者变成师傅；但真正的手感只能靠亲自干出来，光安装别人的 Skill 是不够的。

> 📎 [原文链接](https://mp.weixin.qq.com/s/u2T8rpxEcUROqgjR-mPCAQ)

---

## ⚠️ 未找到的账号

- 刘润：未订阅或名称有误
- InfoQ：未订阅或名称有误
- 营养师顾中一：未订阅或名称有误
- 松庭AI智能体：未订阅或名称有误

---

*生成时间：2026-05-22 北京时间*
