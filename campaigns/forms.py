from django import forms

from campaigns.models import Campaign


class NewCampaignForm(forms.ModelForm):
    class Meta:
        model = Campaign
        fields = (
            'name',
            'banner'
        )

