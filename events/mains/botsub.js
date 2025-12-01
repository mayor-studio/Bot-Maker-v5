const fs = require('fs');
const path = require('path');
const { Client, EmbedBuilder, Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        setInterval(async () => {
            // تحديد مسار ملف tokens.json
            const tokensFilePath = path.join(__dirname, '..', '..', 'tokens', 'tokens.json');

            // تحميل البيانات من ملف JSON
            const data = JSON.parse(fs.readFileSync(tokensFilePath, 'utf8'));

            // Check if data exists
            if (!data) {
                console.log("No data found in tokens.json");
                return;
            }

            // تحديث الوقت المتبقي لكل قسم
            const sections = [
                'azkar', 'feelings', 'verify', 'Bc', 'tax', 'logs', 'ticket', 'tempvoice', 'autoline', 'feedback', 
                'suggestions', 'giveaway', 'apply', 'nadeko', 'invites', 'Broadcast2', 'system', 'shop', 
                'spin', 'privateRooms', 'color', 'games', 'twitter', 'offers', 'warns', 'mention', 'emoji', 'one4all'
            ];

            for (const section of sections) {
                // Skip if section doesn't exist in data
                if (!data[section] || !Array.isArray(data[section])) {
                    console.log(`Section ${section} not found or invalid in data`);
                    continue;
                }

                for (let i = 0; i < data[section].length; i++) {
                    let item = data[section][i];

                    if (item.timeleft >= 0) {
                        item.timeleft -= 300; // تقليل الوقت بمقدار 300 ثانية (5 دقائق)

                        // إعادة تعيين notified إلى false إذا زاد الوقت المتبقي عن 3 أيام
                        if (item.timeleft > 259200) {
                            item.notified = false;
                        }

                        if (item.timeleft <= 259200 && !item.notified) { // 3 أيام
                            let threeDays = new EmbedBuilder()
                                .setColor('#B8860B') // DarkGold Hex Color
                                .setTitle('**اقترب انتهاء الاشتراك**')
                                .setDescription(`**اقترب انتهاء اشتراك بوتك وتبقى 3 ايام يمكنك التجديد قبل الانتهاء لعدم فقد البيانات الخاصة بك. البوت: <@${item.clientId}>**`)
                                .setTimestamp();

                            try {
                                await client.users.fetch(item.owner);
                                let theowner = client.users.cache.get(item.owner);
                                if (theowner) {
                                    await theowner.send({ embeds: [threeDays] });
                                    item.notified = true; // تم إرسال الإشعار
                                }
                            } catch (error) {
                                if (error.code === 50007) {
                                    console.log(`Cannot send message to user ${item.owner}.`);
                                    item.notified = true; 
                                } else {
                                    console.error(`Error sending message to user ${item.owner}:`, error);
                                    item.notified = true; 
                                }
                            }
                        }

                        if (item.timeleft <= 0) {
                            // يمكنك إضافة أي إجراءات أخرى هنا إذا لزم الأمر
                        }
                    }
                }
            }

            // حفظ البيانات إلى ملف JSON
            fs.writeFileSync(tokensFilePath, JSON.stringify(data, null, 2));

            // console.log('Updated timeleft for all items.');
        }, 300000); // 300000 ميلي ثانية = 5 دقائق
    },
};
